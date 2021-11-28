import React from 'react';
import { render } from '@testing-library/react';

import { InitialImplementation as Component } from './AsyncWrapper.stories';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props}/>);
}

it('Should at least render :)', () => {
    renderScreen({});
})

it.todo("Should show the modal when ther is error");
it.todo("Should show the loading screen when it's loading");
it.todo("Should be able to retry");
it.todo("Should be able to exit without retrying");