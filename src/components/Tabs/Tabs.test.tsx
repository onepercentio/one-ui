import React from 'react';
import { render } from '@testing-library/react';
import Component from './Tabs';

const MOCK_OPTIONS = [{
    id: "A",
    label: "A small text"
}, {
    id: "B",
    label: "Big Text Here With some more text"
}, {
    id: "C",
    label: "Chiquito"
}] as const;

it('Should at least render :)', () => {
    render(<Component options={MOCK_OPTIONS} onSelect={o => {}}/>);
})
it("Should move guide to the bottom of p tag with same width and position", () => {
    jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
        return this.textContent.length;
    })
    const wrapper = render(<Component options={MOCK_OPTIONS} selected={"A"} onSelect={() => {}}/>);
    const options = wrapper.getAllByTestId("tab-option");
    expect(options).toHaveLength(3);

    const firstEl = options[0];
    const guideEl =  wrapper.getByTestId("tab-guide");

    expect(`${firstEl.clientWidth}px`).toEqual(guideEl.style.width)
})