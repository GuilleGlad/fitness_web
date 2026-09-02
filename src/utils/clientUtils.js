export const normalizeStatusValue = (value, value2, value3) => {
  if (value3 !== 'client') return 'Activo';
  if (value === null || value === undefined || value === '' && value2 == null && value3 == 'client') return 'Inicial';


  const normalized = String(value).trim().toLowerCase();
  if (['0', 'inicial', 'initial', 'nuevo', 'new', 'inactive', 'inactivo'].includes(normalized)) return 'Inicial';
  if (['1', 'activo', 'active'].includes(normalized)) return 'Activo';

  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) return numericValue === 0 ? 'Inicial' : 'Activo';

  return String(value);
};

export const normalizeStatusCode = (value) => {
  if (value === null || value === undefined || value === '') return 0;

  const normalized = String(value).trim().toLowerCase();
  if (['0', 'inicial', 'initial', 'nuevo', 'new', 'inactive', 'inactivo'].includes(normalized)) return 0;
  if (['1', 'activo', 'active'].includes(normalized)) return 1;

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

export const getClientStatusLabel = (client) => normalizeStatusValue(client?.client_profiles_status,client?.status_cuenta, client?.role);

export const getCuentaLabel = (client) => {
  const isDeleted = Number(client?.deleted ?? 0) === 1;
  const isDisabled = Number(client?.status_cuenta ?? 1) === 0;
  return (isDeleted || isDisabled) ? 'Inactiva' : 'Activa';
};

export const normalizeClientRow = (item = {}) => {
  const numericDeleted = Number(item.deleted ?? 0);
  const normalizedDeleted = Number.isNaN(numericDeleted) ? 0 : (numericDeleted === 1 ? 1 : 0);

  // status_cuenta es independiente de deleted: si no viene definido, se asume cuenta activa (1).
  const numericCuenta = Number(item.status_cuenta ?? 1);
  const normalizedCuenta = Number.isNaN(numericCuenta) ? 1 : (numericCuenta === 0 ? 0 : 1);

  return {
    ...item,
    id: item.user_id ?? item.id,
    status: normalizeStatusCode(item.status ?? 0),
    deleted: normalizedDeleted,
    status_cuenta: normalizedCuenta,
  };
};
