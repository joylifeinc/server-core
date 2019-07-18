import 'jest';
import * as TypeMoq from 'typemoq';

import { EntityViewTemplate } from './view.template';
import { FakeEntity } from './fake.entity';
import { Context } from '../server/apollo.context';

const contextMock: TypeMoq.IMock<Context> = TypeMoq.Mock.ofType(Context);

describe(' EntityViewTemplate<T>', () => {

  describe('getEntity', () => {
    it('should return the entity used in the contructor', () => {
      const fakeData1 = new FakeEntity();
      fakeData1.key = 1;
      fakeData1.id = '1';
      const fakeData2 = new FakeEntity();
      fakeData1.key = 2;
      fakeData2.id = '2';
      const viewTemplate1 = new EntityViewTemplate(contextMock.object, fakeData1);
      const viewTemplate2 = new EntityViewTemplate(contextMock.object, fakeData2);
      expect(viewTemplate1.context).toBe(contextMock.object);
      expect(viewTemplate1.data).toBe(fakeData1);
      expect(viewTemplate1.key).toEqual(fakeData1.key);
      expect(viewTemplate1.id).toEqual(fakeData1.id);
      expect(viewTemplate1.createdAt).toEqual(fakeData1.createAt);
      expect(viewTemplate1.updatedAt).toEqual(fakeData1.updateAt);
      expect(viewTemplate2.data).toBe(fakeData2);
      expect(viewTemplate2.key).toEqual(fakeData2.key);
      expect(viewTemplate2.id).toEqual(fakeData2.id);
      expect(viewTemplate2.createdAt).toEqual(fakeData2.createAt);
      expect(viewTemplate2.updatedAt).toEqual(fakeData2.updateAt);
    });
  });

  // describe('paginateList', () => {
  //   it('should return amount of elements specified by perPage (or available at that page)', () => {
  //     const list = [1, 2, 3, 4, 5, 6, 7];
  //     const modelTemplate = new ModelTemplate(contextMock.object, 'derp');
  //     expect(list).toHaveLength(7);
  //     const paginatedList1 = modelTemplate.paginateList(list, 3, 0);
  //     expect(paginatedList1).toHaveLength(3);
  //     const paginatedList2 = modelTemplate.paginateList(list, 5, 0);
  //     expect(paginatedList2).toHaveLength(5);
  //     const paginatedList3 = modelTemplate.paginateList(list, 10, 0);
  //     expect(paginatedList3).toHaveLength(7);
  //     const paginatedList4 = modelTemplate.paginateList(list, 3, 1);
  //     expect(paginatedList4).toHaveLength(3);
  //     const paginatedList5 = modelTemplate.paginateList(list, 5, 1);
  //     expect(paginatedList5).toHaveLength(2);
  //   });
  // });

  // it('should return in that page as the page index increases', () => {
  //   const list = ['flerp', 'derp', 'fizz', 'buzz', 'foo', 'bar', 'disco', 'inferno'];
  //   const modelTemplate = new ModelTemplate(contextMock.object, 'derp');
  //   const paginatedList1 = modelTemplate.paginateList(list, 3, 0);
  //   expect(paginatedList1[0]).toBe('flerp');
  //   expect(paginatedList1[1]).toBe('derp');
  //   expect(paginatedList1[2]).toBe('fizz');
  //   const paginatedList2 = modelTemplate.paginateList(list, 3, 1);
  //   expect(paginatedList2[0]).toBe('buzz');
  //   expect(paginatedList2[1]).toBe('foo');
  //   expect(paginatedList2[2]).toBe('bar');
  //   const paginatedList3 = modelTemplate.paginateList(list, 3, 2);
  //   expect(paginatedList3[0]).toBe('disco');
  //   expect(paginatedList3[1]).toBe('inferno');
  //   expect(paginatedList3[2]).toBe(undefined);
  // });

  // it('should be an immutable function', () => {
  //   const list = ['flerp', 'derp', 'fizz', 'buzz', 'foo', 'bar', 'disco', 'inferno'];
  //   const modelTemplate = new ModelTemplate(contextMock.object, 'derp');
  //   const paginatedList = modelTemplate.paginateList(list, 8, 0);
  //   expect(paginatedList).not.toBe(list);
  // })
});