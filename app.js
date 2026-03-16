<script>
        console.log("[SISTEMA] Inicializando módulo de simulación...");

        // --- VARIABLES GLOBALES ---
        let escenarioActual = 0;
        let score = 0;
        let temporizadorInterval;
        let segundosTranscurridos = 0;
        let tiempoTotal = 0; 
        let alias = "";
        
        let modalInstancia;

        // --- BASE DE DATOS DE ESCENARIOS (Sin números fijos en el título) ---
        const escenarios = [
            {
                titulo: "Urgencia Ejecutiva (Fraude del CEO)",
                descripcion: "Recibes un correo de tu director a tu cuenta corporativa.",
                contenido: `<strong>De:</strong> director.general@tuempresa.com.co<br><strong>Asunto:</strong> URGENTE: Compra de tarjetas de regalo para clientes<br><br>Ángel, estoy en una reunión y no puedo contestar llamadas. Necesito que compres 5 tarjetas de regalo de Amazon de $1,000 MXN cada una para unos clientes clave hoy mismo. Mándame los códigos por aquí apenas los tengas. Te reembolso en la tarde.<br><br>Enviado desde mi iPhone.`,
                esLegitimo: false,
                feedbackCorrecto: "¡Excelente! Identificaste el ataque. Usan urgencia extrema, piden transferencias de valor no rastreables (tarjetas de regalo) y el dominio del remitente termina en '.com.co' en lugar del oficial.",
                feedbackIncorrecto: "Caíste. Este es un clásico 'Fraude del CEO'. Los atacantes falsifican el nombre de un superior y usan un tono de urgencia para que actúes rápido sin pensar."
            },
            {
                titulo: "Alerta de Seguridad (Ataque Homógrafo)",
                descripcion: "Llega una notificación a tu correo personal sobre tu cuenta bancaria.",
                contenido: `<strong>De:</strong> alertas@citiḃank.com<br><strong>Asunto:</strong> Bloqueo preventivo de cuenta<br><br>Estimado cliente, hemos detectado un intento de inicio de sesión sospechoso. Por su seguridad, hemos bloqueado temporalmente sus transferencias. Para verificar su identidad y desbloquear la cuenta, ingrese aquí:<br><br><a href="#" style="color: #00ff41;">https://www.citiḃank.com/verificacion-segura</a>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Muy bien! Notaste el carácter extraño en la 'b' de citiḃank. Este es un ataque homógrafo usando caracteres Unicode que se parecen visualmente para engañar tu ojo.",
                feedbackIncorrecto: "¡Cuidado! Este es un ataque homógrafo. Si observas de cerca la letra 'b' en 'citiḃank', verás que tiene un punto arriba (ḃ). Es un dominio falso."
            },
            {
                titulo: "Correo Interno Legítimo",
                descripcion: "Mensaje de Recursos Humanos en la bandeja de entrada.",
                contenido: `<strong>De:</strong> rh@tuempresa.com<br><strong>Asunto:</strong> Recordatorio: Actualización de datos de emergencia<br><br>Hola a todos. Les recordamos que tienen hasta el viernes para actualizar sus contactos de emergencia en el portal interno de empleados (portal.tuempresa.local).<br><br>Cualquier duda, pueden marcar a la extensión 104.`,
                esLegitimo: true,
                feedbackCorrecto: "¡Correcto! Es un correo seguro. Proviene del dominio interno oficial, no pide hacer clic en enlaces externos sospechosos ni solicita contraseñas.",
                feedbackIncorrecto: "Te equivocaste, este correo era seguro. Analiza la falta de urgencia, el remitente válido y que no hay enlaces maliciosos."
            },
            {
                titulo: "Factura con Adjunto (Malware)",
                descripcion: "El departamento de contabilidad te reenvía esto pidiendo revisión.",
                contenido: `<strong>De:</strong> facturacion@proveedor-servicios.net<br><strong>Asunto:</strong> Factura de servicios correspondiente a Marzo 2026<br><br>Buen día, adjunto la factura de los servicios de este mes. Por favor, revisa el detalle en el archivo Excel para proceder con el pago.<br><br>📎 <em>Factura_Marzo_2026.xlsx.exe</em>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Excelente! Te diste cuenta de la doble extensión (.xlsx.exe). Es un ejecutable malicioso disfrazado de Excel.",
                feedbackIncorrecto: "¡Peligro crítico! El archivo termina en '.exe', lo que significa que al abrirlo podrías instalar un troyano o ransomware."
            },
            {
                titulo: "Fatiga MFA (Autenticación Multifactor)",
                descripcion: "Estás trabajando en tu PC y tu celular vibra repetidas veces.",
                contenido: `<strong>📱 Notificación en tu celular (Microsoft Authenticator):</strong><br><br>¿Aprobar inicio de sesión?<br><strong>Aplicación:</strong> Office 365<br><strong>Ubicación:</strong> Moscú, Rusia<br><br>[ APROBAR ] &nbsp;&nbsp;&nbsp; [ DENEGAR ]`,
                esLegitimo: false,
                feedbackCorrecto: "¡Bien hecho! Denegaste el acceso. Los atacantes que ya tienen tu contraseña intentan saturarte de notificaciones esperando que apruebes por desesperación.",
                feedbackIncorrecto: "¡Mal! Acabas de darle acceso al atacante a tu cuenta corporativa. Nunca apruebes una solicitud MFA que tú no hayas iniciado."
            },
            {
                titulo: "Smishing (SMS Fraudulento)",
                descripcion: "Recibes un mensaje de texto en tu teléfono móvil.",
                contenido: `<strong>De:</strong> +52 55 1234 5678<br><br>FEDEX: Su paquete no pudo ser entregado hoy por falta de pago de aduanas ($45 MXN). Pague ahora para reprogramar su entrega: <br><a href="#" style="color: #00ff41;">https://bit.ly/fedex-aduanas-mx</a>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Correcto! Es un caso clásico de Smishing. Usan enlaces acortados y piden pagos pequeños para robar tu tarjeta.",
                feedbackIncorrecto: "Caíste en un ataque de Smishing. Las paqueterías reales rara vez piden pagos de aduana a través de enlaces acortados."
            },
            {
                titulo: "Baiting (Oferta Irresistible)",
                descripcion: "Navegando por la web, ves un banner en un foro de tecnología.",
                contenido: `<strong>OFERTA EXCLUSIVA PARA MIEMBROS DEL FORO</strong><br><br>¡Descarga Adobe Creative Cloud Completo GRATIS (Licencia de por vida 2026)!<br>Oferta válida solo por los próximos 15 minutos.<br><br><button class="btn btn-warning btn-sm">DESCARGAR AHORA (.zip)</button>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Muy bien! Identificaste el Baiting. Ofrecer software caro de forma gratuita es un gancho común para que descargues malware.",
                feedbackIncorrecto: "¡Infección exitosa! Este ataque se llama Baiting (Cebo). Te ofrecen algo gratis para que tú mismo descargues el virus."
            },
            {
                titulo: "Boletín Informativo Legítimo",
                descripcion: "Recibes un correo de una suscripción de noticias de ciberseguridad.",
                contenido: `<strong>De:</strong> boletin@thehackernews.com<br><strong>Asunto:</strong> Resumen semanal: Nuevas vulnerabilidades Zero-Day<br><br>Hola Ángel. Aquí tienes tu resumen semanal. Esta semana analizamos cómo un grupo APT explotó una falla en routers corporativos. Lee el artículo completo en nuestro blog.`,
                esLegitimo: true,
                feedbackCorrecto: "¡Perfecto! Analizaste el remitente y el contexto. Es un correo de marketing/boletín legítimo al que estás suscrito.",
                feedbackIncorrecto: "Te equivocaste, este correo es legítimo. El dominio es correcto, no hay adjuntos raros y es información esperada."
            },
            {
                titulo: "Spoofing de Soporte Técnico",
                descripcion: "Un correo llega justo cuando estás teniendo problemas con tu red.",
                contenido: `<strong>De:</strong> soporte.ti.upslp@gmail.com<br><strong>Asunto:</strong> Mantenimiento de servidores escolares<br><br>Estimado estudiante, estamos migrando los servidores de la universidad. Para no perder el acceso a la plataforma escolar, por favor revalida tu matrícula y contraseña en el siguiente portal de respaldo antes de la medianoche.<br><a href="#" style="color: #00ff41;">http://soporte-upslp.webcindario.com/login</a>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Bien detectado! El departamento de TI oficial jamás usaría un correo '@gmail.com' ni un subdominio gratuito ('webcindario').",
                feedbackIncorrecto: "¡Caíste! Fíjate en el remitente: es un '@gmail.com', no el dominio oficial '@upslp.edu.mx', y el enlace es HTTP sin cifrar."
            },
            {
                titulo: "Subdominio Engañoso",
                descripcion: "Te llega un recibo de un pago que no reconoces.",
                contenido: `<strong>De:</strong> recibos@paypal.com.soporte-clientes.net<br><strong>Asunto:</strong> Recibo de su pago a Netflix por $299 MXN<br><br>Has enviado un pago automático. Si tú no autorizaste esta transacción, puedes cancelarla y solicitar un reembolso haciendo clic en el enlace de resolución de disputas inmediatamente.<br><a href="#" style="color: #00ff41;">Ir al Centro de Resoluciones</a>`,
                esLegitimo: false,
                feedbackCorrecto: "¡Excelente cierre! Identificaste el engaño. Aunque empieza con 'paypal.com', el dominio real que controla el correo es 'soporte-clientes.net'.",
                feedbackIncorrecto: "Fallaste. Aunque leas 'paypal.com', el dominio raíz real está al final antes del '.net' ('soporte-clientes.net')."
            }
        ];

        // --- FUNCIONES Y LÓGICA ---
        
        // Función para barajear el arreglo de forma aleatoria (Fisher-Yates)
        function mezclarEscenarios(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const feedbackModalEl = document.getElementById('feedbackModal');
            modalInstancia = new bootstrap.Modal(feedbackModalEl);
        });

        document.getElementById('btnEmpezar').addEventListener('click', () => {
            const inputAlias = document.getElementById('aliasUsuario').value.trim();
            if (inputAlias === "") {
                alert("🚨 Necesitas ingresar un Alias para registrarte en el Scoreboard.");
                return;
            }
            alias = inputAlias;
            
            // ¡MEZCLAMOS LOS ESCENARIOS ANTES DE EMPEZAR!
            mezclarEscenarios(escenarios);
            
            document.getElementById('pantalla-registro').setAttribute('style', 'display: none !important');
            document.getElementById('pantalla-quiz').setAttribute('style', 'display: block !important');
            document.getElementById('pantalla-quiz').classList.remove('hidden');
            
            cargarEscenario();
        });

        function cargarEscenario() {
            if (escenarioActual >= escenarios.length) {
                finalizarQuiz();
                return;
            }

            const escenario = escenarios[escenarioActual];
            document.getElementById('progreso-texto').innerText = `> Escenario ${escenarioActual + 1}/${escenarios.length}`;
            document.getElementById('titulo-escenario').innerText = escenario.titulo;
            document.getElementById('descripcion-escenario').innerText = escenario.descripcion;
            document.getElementById('contenido-simulado').innerHTML = escenario.contenido;

            segundosTranscurridos = 0;
            document.getElementById('temporizador').innerText = segundosTranscurridos;
            
            clearInterval(temporizadorInterval);
            temporizadorInterval = setInterval(() => {
                segundosTranscurridos++;
                tiempoTotal++;
                document.getElementById('temporizador').innerText = segundosTranscurridos;
            }, 1000);
        }

        function responder(respuestaUsuario) {
            clearInterval(temporizadorInterval);
            
            const escenario = escenarios[escenarioActual];
            const esCorrecto = (respuestaUsuario === escenario.esLegitimo);
            
            const modalTitle = document.getElementById('feedbackTitulo');
            const modalMensaje = document.getElementById('feedbackMensaje');
            
            if (esCorrecto) {
                score += 10;
                modalTitle.innerText = "[+] ACCESO DENEGADO - ¡Acierto!";
                modalTitle.style.color = "#00ff41";
                modalMensaje.innerText = escenario.feedbackCorrecto;
            } else {
                modalTitle.innerText = "[-] SISTEMA COMPROMETIDO - Fallaste";
                modalTitle.style.color = "#ff3333";
                modalMensaje.innerText = escenario.feedbackIncorrecto;
            }

            modalInstancia.show();
        }

        function siguienteEscenario() {
            modalInstancia.hide();
            
            setTimeout(() => {
                escenarioActual++;
                cargarEscenario();
            }, 400); 
        }

        function finalizarQuiz() {
            document.getElementById('pantalla-quiz').setAttribute('style', 'display: none !important');
            document.getElementById('pantalla-resultados').setAttribute('style', 'display: block !important');
            document.getElementById('pantalla-resultados').classList.remove('hidden');
            
            const maxScore = escenarios.length * 10;
            document.getElementById('score-final').innerText = `${score}/${maxScore}`;
            document.getElementById('alias-tabla').innerText = alias;
            document.getElementById('score-tabla').innerText = score;
            document.getElementById('tiempo-tabla').innerText = `${tiempoTotal}s`;
        }
    </script>
