import React from 'react';
import { render } from '@testing-library/react';

import { InitialImplementation as Component } from './AdaptiveDialog.stories';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props}/>);
}

it('Should at least render :)', () => {
    renderScreen({});
})

