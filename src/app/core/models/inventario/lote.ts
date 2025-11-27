import {EstadoGeneral} from '../cliente/estadoGeneral';

export interface Lote {
  idLote?: number;
  productoNombre: string;
  codigoLote: string;
  fechaElaboracion: string;
  fechaVencimiento?: string;
  cantidadInicial: number;
  cantidadActual: number;
  estado: EstadoGeneral;
  diasParaVencer?: number;
  estaProximoAVencer: boolean;
  estaVencido: boolean;
}
