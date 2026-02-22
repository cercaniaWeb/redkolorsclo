import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Cargar variables de entorno del archivo .env.local de la raíz
dotenv.config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Obligatorio usar role service_key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("No se encontraron credenciales de Supabase en .env.local")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const testUsers = [
    { email: 'admin@redkolors.com', password: 'red123456', role: 'admin', name: 'Administrador Demo' },
    { email: 'cajero@redkolors.com', password: 'red123456', role: 'cajero', name: 'Cajero Demo' },
    { email: 'cliente@redkolors.com', password: 'red123456', role: 'cliente', name: 'Cliente Demo' },
]

async function seedUsers() {
    console.log("Creando usuarios de prueba en Supabase...")

    for (const user of testUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                full_name: user.name,
                role: user.role
            }
        })

        if (error) {
            if (error.message.includes('already been registered')) {
                console.log(`[OK] El usuario ${user.email} (${user.role}) ya existe.`)
            } else {
                console.error(`[Error] Falló la creación de ${user.email} ->`, error.message)
            }
        } else {
            console.log(`[CREADO] ${user.email} con rol ${user.role} registrado con éxito.`)

            try {
                // Intentar forzar el perfil por si el Trigger SQL que inserta falló porque no estaba cargado antes:
                await supabase.from('profiles').upsert({
                    id: data.user.id,
                    role: user.role,
                    full_name: user.name
                }, { onConflict: 'id' }).then((response) => {
                    if (response.error) console.log(`  > Perfil no creado para ${user.email} con error: ${response.error.message}`)
                })
            } catch (e) {
                // ignore
            }
        }
    }
}

seedUsers()
