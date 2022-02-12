import React from 'react';
import { render } from '@testing-library/react';

import { InitialImplementation as Component } from './AnchoredTooltip.stories';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props}/>);
}

it('Should at least render :)', () => {
    renderScreen({});
})

/**
 * Here in this component there is 3 elements at play
 * The tooltip - That will have a width and height based on children
 * The anchor - The element that the tooltip should be displayed relative to
 * The viewport - Where the tooltip will be positioned, that can overflow content
 */

/**
 * All elements will have a size bound to them
 */
type Dimension = {
  width: number;
  height: number;
}

/**
 * This will indicate where the center of our element is locate into
 */
type Position = {
  top: number;
  left: number;
}


it.todo("Should display over the bound element", () => {

});
it.todo("Should position under when it can't show fully on top");
it.todo("Should move left when the content will overflow viewport");
it.todo("Should anchor to parent if we scroll over the current position");