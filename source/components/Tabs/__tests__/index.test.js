import React from 'react';
import { mount, render } from 'enzyme';
import Tabs from '../index.tsx';

const { TabPane } = Tabs;

describe('Tabs', () => {
  describe('editable-card', () => {
    let handleEdit;
    let wrapper;

    beforeEach(() => {
      handleEdit = jest.fn();
      wrapper = mount(
        <Tabs type="editable-card" onEdit={handleEdit}>
          <TabPane tab="foo" key="1">foo</TabPane>
        </Tabs>
      );
    });

    it('add card', () => {
      wrapper.find('.fishd-tabs-new-tab').hostNodes().simulate('click');
      expect(handleEdit.mock.calls[0][1]).toBe('add');
    });

    it('remove card', () => {
      wrapper.find('.fishdicon-close-tag-line').simulate('click');
      expect(handleEdit).toBeCalledWith('1', 'remove');
    });
  });

  describe('tabPosition', () => {
    it('match position left', () => {
      const wrapper = render(
        <Tabs tabPosition="left" tabBarExtraContent="xxx">
          <TabPane tab="foo" key="1">foo</TabPane>
        </Tabs>
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});
