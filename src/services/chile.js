export const REGIONS = [
  {
    name: 'Región Metropolitana',
    communes: ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'La Florida', 'Maipú', 'Puente Alto', 'San Miguel', 'Vitacura', 'Lo Barnechea', 'La Reina', 'Peñalolén', 'Independencia', 'Recoleta', 'Estación Central', 'Quilicura', 'Renca', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Huechuraba', 'La Cisterna', 'La Granja', 'Lo Espejo', 'Lo Prado', 'Macul', 'Padre Hurtado', 'Pedro Aguirre Cerda', 'Pirque', 'Providencia', 'Pudahuel', 'Quinta Normal', 'San Bernardo', 'San Joaquín', 'San Ramón'],
  },
  {
    name: 'Valparaíso',
    communes: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes', 'San Felipe', 'Quillota', 'La Calera', 'Limache', 'Olmué', 'Zapallar', 'Papudo', 'La Ligua', 'Cabildo', 'Petorca'],
  },
  {
    name: 'Biobío',
    communes: ['Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Coronel', 'Lota', 'Hualpén', 'Los Ángeles', 'Chillán', 'Tomé', 'Penco', 'Hualqui', 'Santa Juana', 'Yumbel', 'Cabrero'],
  },
  {
    name: 'Antofagasta',
    communes: ['Antofagasta', 'Calama', 'San Pedro de Atacama', 'Tocopilla', 'Mejillones', 'Taltal', 'Sierra Gorda', 'María Elena', 'Ollagüe'],
  },
  {
    name: 'La Araucanía',
    communes: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol', 'Lautaro', 'Victoria', 'Nueva Imperial', 'Freire', 'Gorbea', 'Loncoche', 'Carahue'],
  },
  {
    name: "O'Higgins",
    communes: ['Rancagua', 'San Fernando', 'Rengo', 'Machalí', 'Graneros', 'Santa Cruz', 'Pichilemu', 'San Vicente', 'Chimbarongo', 'Codegua', 'Doñihue', 'Las Cabras', 'Peumo', 'Quinta Tilcoco'],
  },
  {
    name: 'Maule',
    communes: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Molina', 'San Javier', 'Cauquenes', 'Parral', 'Rauco', 'Sagrada Familia', 'Teno', 'Romeral', 'Hualañé', 'Licantén'],
  },
  {
    name: 'Los Lagos',
    communes: ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Llanquihue', 'Frutillar', 'Calbuco', 'Maullín', 'Chonchi', 'Quellón', 'Río Negro', 'Purranque', 'San Pablo'],
  },
  {
    name: 'Coquimbo',
    communes: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Andacollo', 'Los Vilos', 'Salamanca', 'Monte Patria', 'Punitaqui', 'Combarbalá'],
  },
  {
    name: 'Arica y Parinacota',
    communes: ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  },
  {
    name: 'Tarapacá',
    communes: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica', 'Huara', 'Colchane', 'Camiña'],
  },
  {
    name: 'Atacama',
    communes: ['Copiapó', 'Vallenar', 'Huasco', 'Caldera', 'Chañaral', 'Diego de Almagro', 'Tierra Amarilla', 'Alto del Carmen', 'Freirina'],
  },
  {
    name: 'Los Ríos',
    communes: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Lanco', 'Los Lagos', 'Futrono', 'Mariquina', 'Máfil', 'Paillaco', 'Corral'],
  },
  {
    name: 'Aysén',
    communes: ['Coyhaique', 'Puerto Aysén', 'Cochrane', 'Chile Chico', 'Tortel', 'Río Ibáñez', 'Guaitecas', 'Lago Verde', 'O\'Higgins'],
  },
  {
    name: 'Magallanes',
    communes: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos', 'San Gregorio', 'Laguna Blanca', 'Río Verde', 'Primavera', 'Timaukel', 'Torres del Paine'],
  },
]

export function getCommunes(regionName) {
  const region = REGIONS.find(r => r.name === regionName)
  return region ? region.communes : []
}
