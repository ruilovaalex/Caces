import { config } from 'dotenv';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

config({ path: join(__dirname, '..', '.env') });

// Las pruebas siempre usan la base y el almacenamiento de prueba, nunca los de desarrollo.
process.env.DATABASE_URL = process.env.TEST_RUN_DATABASE_URL;
process.env.JWT_SECRET = 'clave-de-pruebas-con-mas-de-treinta-y-dos-caracteres';
process.env.STORAGE_LOCAL_DIR = join(tmpdir(), 'caces-test-storage');
process.env.MAX_UPLOAD_MB = '1';
process.env.SEED_DEFAULT_PASSWORD = 'Prueba.12345';
