import { expect, test } from 'vitest';
import { slugify } from '@/lib/slug';

test.each([
    ['  Imágenes Religiosas  ', 'imagenes-religiosas'],
    ['Niño Jesús / 25 cm', 'nino-jesus-25-cm'],
    ['Set --- de regalo!', 'set-de-regalo'],
    ['', ''],
])('Normaliza %j como %j', (name, expected) => {
    expect(slugify(name)).toBe(expected);
});
