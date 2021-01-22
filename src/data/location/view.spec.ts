
import { LocationView, DecoratedLocationView, NO_LOCATION } from './view';
import { createContext, Context } from '../../server/apollo.context';
import { LocationModelTemplate } from './model';
import { LocationInterface } from '../../graphql/core.types';

class TestLocation extends LocationModelTemplate {};


const LOCATION = Object.assign(new TestLocation(), {
  id: "6e506e50-abcd-cdef-1234-567890abcdef",
  address1: "ADDRESS_1",
  address2: "ADDRESS_2",
  city: "CITY",
  state: "STATE",
  country: "COUNTRY",
  postalCode: "POSTAL_CODE",
  latitude: 0,
  longitude: 0,
  placeId: "PLACE_ID",
});

const EMPTY_LOCATION = new TestLocation();

describe('#LocationView', () => {
  let view: LocationView;
  let context: Context;

  beforeEach(() => {
    context = createContext();
    view = new LocationView(
      context,
      LOCATION)
  });

  it ('looks up basic information', () => {
    expect(view.id).toBe("6e506e50-abcd-cdef-1234-567890abcdef");
    expect(view.address1).toBe("ADDRESS_1");
    expect(view.address2).toBe("ADDRESS_2");
    expect(view.city).toBe("CITY");
    expect(view.country).toBe("COUNTRY");
    expect(view.postalCode).toBe("POSTAL_CODE");
    expect(view.latitude).toBe(0);
    expect(view.longitude).toBe(0);
    expect(view.placeId).toBe("PLACE_ID");
  });


});

  describe('#DecoratedLocationView', () => {
    let context: Context;
    const MAX_DECORATOR = {
      address1: "DECORATOR_ADDRESS_1",
      address2: "DECORATOR_ADDRESS_2",
      city: "DECORATOR_CITY",
      state: "DECORATOR_STATE",
      country: "DECORATOR_COUNTRY",
      postalCode: "DECORATOR_POSTAL_CODE",
      latitude: 1,
      longitude: 1,
      placeId: "DECORATOR_PLACE_ID",
    };

    const EMPTY_DECORATOR = {};

    beforeEach(() => {
      context = createContext();
    });

    it ('returns original value without a decorator', () => {
      const view = new DecoratedLocationView(context, LOCATION);

      expect(view.id).toBe("6e506e50-abcd-cdef-1234-567890abcdef");
      expect(view.address1).toBe("ADDRESS_1");
      expect(view.address2).toBe("ADDRESS_2");
      expect(view.city).toBe("CITY");
      expect(view.country).toBe("COUNTRY");
      expect(view.postalCode).toBe("POSTAL_CODE");
      expect(view.latitude).toBe(0);
      expect(view.longitude).toBe(0);
      expect(view.placeId).toBe("PLACE_ID");
    });

    it ('maximal decorator coverage', () => {

      const view = new DecoratedLocationView(context, LOCATION, MAX_DECORATOR);

      expect(view.id).toBe("6e506e50-abcd-cdef-1234-567890abcdef");
      expect(view.address1).toBe("DECORATOR_ADDRESS_1");
      expect(view.address2).toBe("DECORATOR_ADDRESS_2");
      expect(view.city).toBe("DECORATOR_CITY");
      expect(view.country).toBe("DECORATOR_COUNTRY");
      expect(view.postalCode).toBe("DECORATOR_POSTAL_CODE");
      expect(view.latitude).toBe(1);
      expect(view.longitude).toBe(1);
      expect(view.placeId).toBe("DECORATOR_PLACE_ID");
    });

    describe('#isEmpty', () => {
      it ('detects if the decorator is empty', async () => {
        const emptyDecorator = {};
        let view = new DecoratedLocationView(context, LOCATION, EMPTY_DECORATOR)

        expect(view.isEmpty()).toBe(true);

        const decorator = {
          address1: 'ADDRESS_1'
        }
        view = new DecoratedLocationView(context, EMPTY_LOCATION, decorator);

        expect(view.isEmpty()).toBe(true);

      });
    });

    describe('#decorate', () => {
      it ('decorates', async () => {
        const view = new DecoratedLocationView(context, LOCATION);

        expect(view.id).toBe("6e506e50-abcd-cdef-1234-567890abcdef");
        expect(view.address1).toBe("ADDRESS_1");
        expect(view.address2).toBe("ADDRESS_2");
        expect(view.city).toBe("CITY");
        expect(view.country).toBe("COUNTRY");
        expect(view.postalCode).toBe("POSTAL_CODE");
        expect(view.latitude).toBe(0);
        expect(view.longitude).toBe(0);
        expect(view.placeId).toBe("PLACE_ID");

        view.decorate(MAX_DECORATOR);

        expect(view.id).toBe("6e506e50-abcd-cdef-1234-567890abcdef");
        expect(view.address1).toBe("DECORATOR_ADDRESS_1");
        expect(view.address2).toBe("DECORATOR_ADDRESS_2");
        expect(view.city).toBe("DECORATOR_CITY");
        expect(view.country).toBe("DECORATOR_COUNTRY");
        expect(view.postalCode).toBe("DECORATOR_POSTAL_CODE");
        expect(view.latitude).toBe(1);
        expect(view.longitude).toBe(1);
        expect(view.placeId).toBe("DECORATOR_PLACE_ID");



      });
    })


   });

