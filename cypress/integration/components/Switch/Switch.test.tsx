import React from 'react';
import { mount } from 'cypress/react';

import { InitialImplementation as Component } from 'components/Switch/Switch.stories';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return mount(<Component {...props}/>);
}

it('Should at least render :)', () => {
    renderScreen({});
})

it("Should be able to toggle between states");