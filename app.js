// --- VARIABLES GLOBALES ---
let escenarioActual = 0;
let score = 0;
let tiempoInicio;
let temporizadorInterval;
let segundosTranscurridos = 0;
let tiempoTotal = 0; // Para medir cuánto tardó en todo el quiz
let alias = "";

// --- BASE DE DATOS DE ESCENARIOS (10 Escenarios variados según rúbrica) ---
const escenarios = [
    {
        titulo: "1. Urgencia Ejecutiva (Fraude del CEO)",
        descripcion: "Recibes un correo de tu director a tu cuenta corporativa.",
        contenido: `
            <strong>De:</strong> director.general@tuempresa.com.co<br>
            <strong>Asunto:</strong> URGENTE: Compra de tarjetas de regalo para clientes<br><br>
            Ángel, estoy en una reunión y no puedo contestar llamadas. Necesito que compres 5 tarjetas de regalo de Amazon de $1,000 MXN cada una para unos clientes clave hoy mismo. Mándame los códigos por aquí apenas los tengas. Te reembolso en la tarde.<br><br>
            Enviado desde mi iPhone.
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Excelente! Identificaste el ataque. Usan urgencia extrema, piden transferencias de valor no rastreables (tarjetas de regalo) y el dominio del remitente termina en '.com.co' en lugar del oficial.",
        feedbackIncorrecto: "Caíste. Este es un clásico 'Fraude del CEO'. Los atacantes falsifican el nombre de un superior y usan un tono de urgencia para que actúes rápido sin pensar. Además, fíjate en el dominio falso (.com.co)."
    },
    {
        titulo: "2. Alerta de Seguridad (Ataque Homógrafo)",
        descripcion: "Llega una notificación a tu correo personal sobre tu cuenta bancaria.",
        contenido: `
            <strong>De:</strong> alertas@citiḃank.com<br>
            <strong>Asunto:</strong> Bloqueo preventivo de cuenta<br><br>
            Estimado cliente, hemos detectado un intento de inicio de sesión sospechoso. Por su seguridad, hemos bloqueado temporalmente sus transferencias. Para verificar su identidad y desbloquear la cuenta, ingrese aquí:<br><br>
            <a href="#" style="color: #00ff41;">https://www.citiḃank.com/verificacion-segura</a>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Muy bien! Notaste el carácter extraño en la 'b' de citiḃank. Este es un ataque homógrafo usando caracteres Unicode que se parecen visualmente para engañar tu ojo.",
        feedbackIncorrecto: "¡Cuidado! Este es un ataque homógrafo. Si observas de cerca la letra 'b' en 'citiḃank', verás que tiene un punto arriba (ḃ). Es un dominio completamente distinto al real."
    },
    {
        titulo: "3. Correo Interno Legítimo",
        descripcion: "Mensaje de Recursos Humanos en la bandeja de entrada.",
        contenido: `
            <strong>De:</strong> rh@tuempresa.com<br>
            <strong>Asunto:</strong> Recordatorio: Actualización de datos de emergencia<br><br>
            Hola a todos. Les recordamos que tienen hasta el viernes para actualizar sus contactos de emergencia en el portal interno de empleados (portal.tuempresa.local).<br><br>
            Cualquier duda, pueden marcar a la extensión 104.
        `,
        esLegitimo: true,
        feedbackCorrecto: "¡Correcto! Es un correo seguro. Proviene del dominio interno oficial, no pide hacer clic en enlaces externos sospechosos ni solicita contraseñas por correo.",
        feedbackIncorrecto: "Te equivocaste, este correo era seguro. A veces la concientización extrema nos vuelve paranoicos. Analiza la falta de urgencia, el remitente válido y que no hay enlaces maliciosos."
    },
    {
        titulo: "4. Factura con Adjunto (Malware)",
        descripcion: "El departamento de contabilidad te reenvía esto pidiendo revisión.",
        contenido: `
            <strong>De:</strong> facturacion@proveedor-servicios.net<br>
            <strong>Asunto:</strong> Factura de servicios correspondiente a Marzo 2026<br><br>
            Buen día, adjunto la factura de los servicios de este mes. Por favor, revisa el detalle en el archivo Excel para proceder con el pago.<br><br>
            📎 <em>Factura_Marzo_2026.xlsx.exe</em>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Excelente! Te diste cuenta de la doble extensión (.xlsx.exe). Es un ejecutable malicioso disfrazado de Excel. Descargarlo habría infectado el equipo.",
        feedbackIncorrecto: "¡Peligro crítico! El archivo termina en '.exe', lo que significa que al abrirlo podrías instalar un troyano o ransomware en tu equipo. Siempre revisa las extensiones reales."
    },
    {
        titulo: "5. Fatiga MFA (Autenticación Multifactor)",
        descripcion: "Estás trabajando en tu PC y tu celular vibra repetidas veces.",
        contenido: `
            <strong>📱 Notificación en tu celular (Microsoft Authenticator):</strong><br><br>
            ¿Aprobar inicio de sesión?<br>
            <strong>Aplicación:</strong> Office 365<br>
            <strong>Ubicación:</strong> Moscú, Rusia<br>
            <br>
            [ APROBAR ] &nbsp;&nbsp;&nbsp; [ DENEGAR ]
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Bien hecho! Denegaste el acceso. Los atacantes que ya tienen tu contraseña intentan saturarte de notificaciones esperando que apruebes por error o desesperación.",
        feedbackIncorrecto: "¡Mal! Acabas de darle acceso al atacante a tu cuenta corporativa. Nunca apruebes una solicitud MFA (Autenticación Multifactor) que tú no hayas iniciado."
    },
    {
        titulo: "6. Smishing (SMS Fraudulento)",
        descripcion: "Recibes un mensaje de texto en tu teléfono móvil.",
        contenido: `
            <strong>De:</strong> +52 55 1234 5678<br><br>
            FEDEX: Su paquete no pudo ser entregado hoy por falta de pago de aduanas ($45 MXN). Pague ahora para reprogramar su entrega: <br>
            <a href="#" style="color: #00ff41;">https://bit.ly/fedex-aduanas-mx</a>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Correcto! Es un caso clásico de Smishing (Phishing por SMS). Usan enlaces acortados (bit.ly) para ocultar la dirección real y piden pagos pequeños para robar tu tarjeta.",
        feedbackIncorrecto: "Caíste en un ataque de Smishing. Las paqueterías reales rara vez piden pagos de aduana a través de enlaces acortados (bit.ly) enviados por números de teléfono comunes."
    },
    {
        titulo: "7. Baiting (Oferta Irresistible)",
        descripcion: "Navegando por la web, ves un banner en un foro de tecnología.",
        contenido: `
            <strong>OFERTA EXCLUSIVA PARA MIEMBROS DEL FORO</strong><br><br>
            ¡Descarga Adobe Creative Cloud Completo GRATIS (Licencia de por vida 2026)!<br>
            Oferta válida solo por los próximos 15 minutos.<br>
            <br>
            <button class="btn btn-warning btn-sm">DESCARGAR AHORA (.zip)</button>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Muy bien! Identificaste el Baiting. Ofrecer software caro de forma gratuita es un gancho común para que descargues software pirata infectado con malware.",
        feedbackIncorrecto: "¡Infección exitosa! Este ataque se llama Baiting (Cebo). Te ofrecen algo demasiado bueno para ser verdad (software caro gratis) para que tú mismo descargues el virus."
    },
    {
        titulo: "8. Boletín Informativo Legítimo",
        descripcion: "Recibes un correo de una suscripción de noticias de ciberseguridad.",
        contenido: `
            <strong>De:</strong> boletin@thehackernews.com<br>
            <strong>Asunto:</strong> Resumen semanal: Nuevas vulnerabilidades Zero-Day<br><br>
            Hola Ángel. Aquí tienes tu resumen semanal. Esta semana analizamos cómo un grupo APT explotó una falla en routers corporativos. Lee el artículo completo en nuestro blog.<br><br>
            Si deseas dejar de recibir estos correos, haz clic en "Desuscribirse" al final del correo.
        `,
        esLegitimo: true,
        feedbackCorrecto: "¡Perfecto! Analizaste el remitente y el contexto. Es un correo de marketing/boletín legítimo al que estás suscrito. No hay indicadores de ataque.",
        feedbackIncorrecto: "Te equivocaste, este correo es legítimo. El dominio es correcto, no hay adjuntos raros y es información esperada. Parte de la seguridad es saber dejar pasar lo que es seguro."
    },
    {
        titulo: "9. Spoofing de Soporte Técnico",
        descripcion: "Un correo llega justo cuando estás teniendo problemas con tu red.",
        contenido: `
            <strong>De:</strong> soporte.ti.upslp@gmail.com<br>
            <strong>Asunto:</strong> Mantenimiento de servidores escolares<br><br>
            Estimado estudiante, estamos migrando los servidores de la universidad. Para no perder el acceso a la plataforma escolar, por favor revalida tu matrícula y contraseña en el siguiente portal de respaldo antes de la medianoche.<br>
            <a href="#" style="color: #00ff41;">http://soporte-upslp.webcindario.com/login</a>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Bien detectado! El departamento de TI oficial de una universidad jamás usaría un correo '@gmail.com' ni alojaría un portal en un subdominio gratuito ('webcindario').",
        feedbackIncorrecto: "¡Caíste! Le diste tus credenciales escolares a un atacante. Fíjate en el remitente: es un '@gmail.com', no el dominio oficial '@upslp.edu.mx', y el enlace es HTTP sin cifrar."
    },
    {
        titulo: "10. Subdominio Engañoso",
        descripcion: "Te llega un recibo de un pago que no reconoces.",
        contenido: `
            <strong>De:</strong> recibos@paypal.com.soporte-clientes.net<br>
            <strong>Asunto:</strong> Recibo de su pago a Netflix por $299 MXN<br><br>
            Has enviado un pago automático. Si tú no autorizaste esta transacción, puedes cancelarla y solicitar un reembolso haciendo clic en el enlace de resolución de disputas inmediatamente.<br>
            <a href="#" style="color: #00ff41;">Ir al Centro de Resoluciones</a>
        `,
        esLegitimo: false,
        feedbackCorrecto: "¡Excelente cierre! Identificaste el engaño. Aunque empieza con 'paypal.com', el dominio real que controla el correo es 'soporte-clientes.net'. Generan pánico por un cargo falso para que actúes.",
        feedbackIncorrecto: "Fallaste. Aunque leas 'paypal.com', el dominio raíz real está al final antes del '.net' ('soporte-clientes.net'). Generar pánico por cargos falsos es súper común para que entres y dejes tu tarjeta."
    }
];

// --- LÓGICA DE LA APLICACIÓN ---

// 1. Iniciar Simulación
document.getElementById('btnEmpezar').addEventListener('click', () => {
    const inputAlias = document.getElementById('aliasUsuario').value.trim();
    if (inputAlias === "") {
        alert("🚨 Necesitas ingresar un Alias para registrarte en el Scoreboard.");
        return;
    }
    alias = inputAlias;
    
    // FORZAR ocultar registro y mostrar quiz (evitando bloqueos de CSS)
    const pantallaRegistro = document.getElementById('pantalla-registro');
    const pantallaQuiz = document.getElementById('pantalla-quiz');
    
    pantallaRegistro.classList.add('hidden');
    pantallaRegistro.style.display = 'none';
    
    pantallaQuiz.classList.remove('hidden');
    pantallaQuiz.style.display = 'block';
    
    cargarEscenario();
});

// 2. Cargar cada escenario
function cargarEscenario() {
    if (escenarioActual >= escenarios.length) {
        finalizarQuiz();
        return;
    }

    const escenario = escenarios[escenarioActual];
    
    // Actualizar Textos en el HTML
    document.getElementById('progreso-texto').innerText = `> Escenario ${escenarioActual + 1}/${escenarios.length}`;
    document.getElementById('titulo-escenario').innerText = escenario.titulo;
    document.getElementById('descripcion-escenario').innerText = escenario.descripcion;
    document.getElementById('contenido-simulado').innerHTML = escenario.contenido;

    // Reiniciar y arrancar temporizador por pregunta
    segundosTranscurridos = 0;
    document.getElementById('temporizador').innerText = segundosTranscurridos;
    
    clearInterval(temporizadorInterval);
    temporizadorInterval = setInterval(() => {
        segundosTranscurridos++;
        tiempoTotal++; // Suma al tiempo global
        document.getElementById('temporizador').innerText = segundosTranscurridos;
    }, 1000);
}

// 3. Evaluar Respuesta
function responder(respuestaUsuario) {
    clearInterval(temporizadorInterval); // Pausar reloj
    
    const escenario = escenarios[escenarioActual];
    const esCorrecto = (respuestaUsuario === escenario.esLegitimo);
    
    // Configurar Modal Bootstrap (Para mostrar en tu tema oscuro)
    const feedbackModalEl = document.getElementById('feedbackModal');
    const modalTitle = document.getElementById('feedbackTitulo');
    const modalMensaje = document.getElementById('feedbackMensaje');
    
    // Lógica de puntuación (10 pts por pregunta correcta)
    if (esCorrecto) {
        score += 10;
        modalTitle.innerText = "[+] ACCESO DENEGADO AL ATACANTE - ¡Acierto!";
        modalTitle.style.color = "#00ff41"; // Verde hacker
        modalMensaje.innerText = escenario.feedbackCorrecto;
    } else {
        modalTitle.innerText = "[-] SISTEMA COMPROMETIDO - Fallaste";
        modalTitle.style.color = "#ff3333"; // Rojo alerta
        modalMensaje.innerText = escenario.feedbackIncorrecto;
    }

    // Instanciar y mostrar el modal
    const bsModal = new bootstrap.Modal(feedbackModalEl);
    bsModal.show();
}

// 4. Siguiente pregunta (Llamado desde el botón del modal)
function siguienteEscenario() {
    // Cerrar modal usando la API de Bootstrap
    const feedbackModalEl = document.getElementById('feedbackModal');
    const bsModal = bootstrap.Modal.getInstance(feedbackModalEl);
    bsModal.hide();
    
    // Pequeño delay para que la animación del modal termine antes de cambiar de pregunta
    setTimeout(() => {
        escenarioActual++;
        cargarEscenario();
    }, 300);
}

// 5. Finalizar Simulación y mostrar Scoreboard local
function finalizarQuiz() {
    // FORZAR ocultar quiz y mostrar resultados
    const pantallaQuiz = document.getElementById('pantalla-quiz');
    const pantallaResultados = document.getElementById('pantalla-resultados');
    
    pantallaQuiz.classList.add('hidden');
    pantallaQuiz.style.display = 'none';
    
    pantallaResultados.classList.remove('hidden');
    pantallaResultados.style.display = 'block';
    
    const maxScore = escenarios.length * 10;
    
    // Llenar datos de tu tarjeta personal
    document.getElementById('score-final').innerText = `${score}/${maxScore}`;
    
    // Llenar datos de la tabla (Visualización temporal antes de Firebase)
    document.getElementById('alias-tabla').innerText = alias;
    document.getElementById('score-tabla').innerText = score;
    document.getElementById('tiempo-tabla').innerText = `${tiempoTotal}s`;

    console.log(`[LOG] Simulación Finalizada. Alias: ${alias} | Score: ${score} | Tiempo: ${tiempoTotal}s`);
    
    // [AQUÍ ENTRAREMOS CON FIREBASE EN EL SIGUIENTE PASO]
}
