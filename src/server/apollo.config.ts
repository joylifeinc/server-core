import { identity } from 'lodash';
import { Config as ApolloServerConfig } from 'apollo-server';
import { EngineReportingOptions } from 'apollo-engine-reporting';
import { ServiceConfigFormat } from 'apollo-language-server';
import { telemetry } from '@withjoy/telemetry';


const FEDERATING_SERVICE_NAME = 'stitch';

function _makeCLIArgs(lines: string[]) {
  return lines.filter(identity).join(' ').trim();
}


export interface ApolloEnvironmentConfig {
  // like ApolloEnvironmentConfigArgs
  variant: ApolloEnvironmentVariant;
  serviceName: string,
  servicePort: number;

  apiKey: string;

  schemaTags: { // aka. the 'variant'
    current: string;
    future: string; // the next sequential environment
  };

  // for use in package.json 'script's
  cliArguments: {
    list: string; // "who are my peers?"
    check: string; // "is it safe to promote this schema?"
    diff: string; // "what's new in the schema i've deployed?"
    push: string; // "register the deployed schema"
  };

  // https://www.apollographql.com/docs/apollo-server/api/apollo-server/
  //   not a complete set; only the things we can contribute to
  serverOptions: ApolloServerConfig;

  // https://www.apollographql.com/docs/apollo-server/api/apollo-server/#enginereportingoptions
  //   not a complete set; only the things we can contribute to
  engineReportingOptions: EngineReportingOptions<any>;

  // for use in `apollo.config.js`
  //   https://www.apollographql.com/docs/resources/apollo-config/
  serviceConfig: ServiceConfigFormat;
}


export enum ApolloEnvironmentVariant {
  local = 'local',
  development = 'development',
  staging = 'staging',
  production = 'production',
};

function _enumerateApolloEnvironmentVariant(variant: ApolloEnvironmentVariant | string): ApolloEnvironmentVariant | undefined {
  switch (variant) {
    case 'test':
    case 'ci':
    case 'local':
      return ApolloEnvironmentVariant.local;
    case 'development':
      return ApolloEnvironmentVariant.development;
    case 'staging':
      return ApolloEnvironmentVariant.staging;
    case 'production':
      return ApolloEnvironmentVariant.production;
    default:
      return undefined;
  }
}

export interface ApolloEnvironmentConfigArgs {
  variant?: ApolloEnvironmentVariant; // defaults to environment settings
  useLocalEndpoint?: boolean; // use your local service as the `endpointUrl` for every variant

  serviceName: string,
  servicePort: string | number;
};


export function deriveApolloEnvironmentConfig(args: ApolloEnvironmentConfigArgs): ApolloEnvironmentConfig {
  const serviceName = args.serviceName;
  const servicePort = parseInt(String(args.servicePort), 10);
  const useLocalEndpoint = args.useLocalEndpoint || false;
  const isFederatingService = (serviceName === FEDERATING_SERVICE_NAME);
  const env = process.env;
  const apiKey = env.ENGINE_API_KEY || '';

  const variantAsString = args.variant || env.ENVIRONMENT || env.NODE_ENV || 'local';
  const variant = _enumerateApolloEnvironmentVariant(variantAsString);
  if (! variant) {
    throw new Error(`unrecognized variant: "${ variantAsString }"`);
  }

  const endpointUrlLocal = `http://localhost:${ servicePort }/graphql`;
  const endpointRoute = (isFederatingService
    ? '/graphql'
    : `/${ serviceName }/graphql` // proxied by the Federating Service
  );

  const VARIANT_CONFIG: Record<string, any> = ({
    [ ApolloEnvironmentVariant.local ]: {
      // "The url of your service"
      //   from which your schema can be derived
      endpoint: {
        url: endpointUrlLocal, // provides the pending schema
        skipSSLValidation: true,
      },
      // "the url to the location of the implementing service for a federated graph"
      //   from which your schema can be derived
      federatingService: {
        url: 'https://bliss-gateway-dev.withjoy.com/graphql', // matches intention of { schemaTags }
        skipSSLValidation: true,
      },
      schemaTags: {
        current: 'development', // there is no 'local'
        future: 'development',
      },
      serverOptions: {
        debug: true,
        introspection: true,
        mocks: false,
        playground: true,
        subscriptions: false, // string | false | Partial<SubscriptionServerOptions> | undefined
        tracing: true,
      },
    },
    [ ApolloEnvironmentVariant.development ]: {
      endpoint: {
        url: (useLocalEndpoint ? endpointUrlLocal : `https://bliss-gateway-dev.withjoy.com${ endpointRoute }`),
        skipSSLValidation: false,
      },
      federatingService: {
        url: 'https://bliss-gateway-dev.withjoy.com/graphql',
        skipSSLValidation: true,
      },
      schemaTags: {
        current: 'development',
        future: 'staging',
      },
      serverOptions: {
        debug: true,
        introspection: true,
        mocks: false,
        playground: true,
        subscriptions: false,
        tracing: true,
      },
    },
    [ ApolloEnvironmentVariant.staging ]: {
      endpoint: {
        url: (useLocalEndpoint ? endpointUrlLocal : `https://bliss-gateway-staging.withjoy.com${ endpointRoute }`),
        skipSSLValidation: false,
      },
      federatingService: {
        url: 'https://bliss-gateway-staging.withjoy.com/graphql',
        skipSSLValidation: false,
      },
      schemaTags: {
        current: 'staging',
        future: 'production',
      },
      serverOptions: {
        debug: true,
        introspection: true,
        mocks: false,
        playground: true,
        subscriptions: false,
        tracing: true,
      },
    },
    [ ApolloEnvironmentVariant.production ]: {
      endpoint: {
        url: (useLocalEndpoint ? endpointUrlLocal : `https://bliss-gateway-prod.withjoy.com${ endpointRoute }`),
        skipSSLValidation: false,
      },
      federatingService: {
        url: 'https://bliss-gateway-prod.withjoy.com/graphql',
        skipSSLValidation: false,
      },
      schemaTags: {
        current: 'production',
        future: 'production', // 'production' is as far as we go
      },
      serverOptions: {
        debug: false,
        introspection: true,
        mocks: false,
        playground: false,
        subscriptions: false,
        tracing: true,
      },
    },
  } as Record<ApolloEnvironmentVariant, any>)[
    variant // Object lookup
  ];

  const endpointUrl = VARIANT_CONFIG.endpoint.url;
  const derived = {
    variant,
    serviceName,
    servicePort,

    apiKey,
    schemaTags: VARIANT_CONFIG.schemaTags,
    cliArguments: {
      // "who are my peers?"
      //   `apollo service:list` for current Environment
      //   https://github.com/apollographql/apollo-tooling#apollo-servicelist
      list: _makeCLIArgs([
        `--key=${ apiKey }`,
        `--tag=${ VARIANT_CONFIG.schemaTags.current }`,
        `--endpoint=${ endpointUrl }`,
      ]),

      // "is it safe to promote this schema?"
      //   `apollo service:check` against *future* Environment
      //   https://github.com/apollographql/apollo-tooling#apollo-servicecheck
      check: _makeCLIArgs([
        `--key=${ apiKey }`,
        `--tag=${ VARIANT_CONFIG.schemaTags.future }`,
        `--endpoint=${ endpointUrl }`,
        // you *can* check the schema from the Federating Service perspective;
        //   it'll check the federated schema as a whole.
        //   the Federating Service exposes its schema as the 'default' service, so no `serviceName`
        (isFederatingService ? '' : `--serviceName=${ serviceName }`),
      ]),

      // "what's new in the schema i've deployed?"
      //   `apollo service:check` against *current* Environment
      //   https://github.com/apollographql/apollo-tooling#apollo-servicecheck
      diff: _makeCLIArgs([
        `--key=${ apiKey }`,
        `--tag=${ VARIANT_CONFIG.schemaTags.current }`,
        `--endpoint=${ endpointUrl }`,
        (isFederatingService ? '' : `--serviceName=${ serviceName }`),
      ]),

      // "register the deployed schema"
      //   `apollo service:push` to *current* Environment
      //   https://github.com/apollographql/apollo-tooling#apollo-servicepush
      push: _makeCLIArgs(isFederatingService
        // you *cannot* push from the Federating Service perspective;
        //   you can only push the schema for the individual Services.
        //   "The model of the service registry is that the graph's schema is computed by composing underlying services."
        ? [] // => "Error: No service found to link to Engine" (because you should never do this)
        : [
          `--key=${ apiKey }`,
          `--tag=${ VARIANT_CONFIG.schemaTags.current }`,
          `--endpoint=${ endpointUrl }`,
          `--serviceURL=${ VARIANT_CONFIG.federatingService.url }`,
          `--serviceName=${ serviceName }`,
        ]
      ),
    },

    serverOptions: {
      ...VARIANT_CONFIG.serverOptions,

      // https://www.apollographql.com/docs/apollo-server/federation/metrics/#turning-it-on
      //   "ensure that implementing services do not report metrics"
      //   the Federating service will want to override the { engine } config
      // https://www.apollographql.com/docs/graph-manager/federation/#metrics-and-observability
      //   "ensure that federated services do not have the ENGINE_API_KEY environment variable set"
      //   fortunately, { engine: false } neutralizes that concern
      engine: false,
      reporting: false,
    },

    engineReportingOptions: {
      apiKey,
      schemaTag: VARIANT_CONFIG.schemaTags.current,
    },

    serviceConfig: {
      endpoint: {
        name: serviceName,
        url: endpointUrl,
        skipSSLValidation: VARIANT_CONFIG.endpoint.skipSSLValidation,
      },
      localSchemaFile: undefined,
      includes: [], // required, empty => use defaults
      excludes: [],
    },
  };

  telemetry.info('deriveApolloEnvironmentConfig', {
    source: 'apollo',
    action: 'config',

    variant,
    serviceName,
    servicePort,
    endpointUrl,
  });
  return derived;
}