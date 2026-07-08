import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';

describe('Settings page', () => {
  it('renderiza los campos de ajustes de la web', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    );

    expect(screen.getByText(/Ajustes de la web/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logotipo/i)).toBeInTheDocument();
    expect(screen.getByText(/Galería del carrusel principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Imágenes para anuncios/i)).toBeInTheDocument();
  });
});
