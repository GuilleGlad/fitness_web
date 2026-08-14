import { normalizeClientRow, getClientStatusLabel, getCuentaLabel } from '../utils/clientUtils';

describe('Clientes', () => {
  it('normaliza los valores de estado y cuenta cuando el backend devuelve status=0 y deleted=0', () => {
    const client = normalizeClientRow({
      user_id: 10,
      name: 'Ana',
      email: 'ana@test.com',
      status: 0,
      deleted: 0,
      status_cuenta: 0,
    });

    expect(client.status).toBe(0);
    expect(client.status_cuenta).toBe(1);
    expect(getClientStatusLabel(client)).toBe('Inicial');
    expect(getCuentaLabel(client)).toBe('Activa');
  });
});
