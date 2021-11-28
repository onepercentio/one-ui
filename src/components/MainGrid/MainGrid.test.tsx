import React from 'react';
import { render } from '@testing-library/react';

import Component from './MainGrid';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props}/>);
}

it('Should at least render :)', () => {
    renderScreen({
      children: <h1>Hey mama</h1>
    });
})

it.todo("Should transition from one element to another correctly");