//Expresiones regulares de contraseña , usuario y teléfono
export const usuarioRegex = /^[a-zA-Z0-9_]+$/;
export const telefonoRegex = /^\+[1-9]\d{6,14}$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;