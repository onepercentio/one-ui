import React from 'react';
import { render } from '@testing-library/react';

import Component from './Select';

it('Should at least render :)', () => {
    render(<Component {...({} as any)}/>);
})