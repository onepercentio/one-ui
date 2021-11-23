import React from 'react';
import { render } from '@testing-library/react';

import Component from './Button';

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component/>);
}

it('Should at least render :)', () => {
    renderScreen({});
})

