import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad — Omniprise',
  description: 'Política de privacidad y protección de datos personales de Omniprise S.A.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-surface-800 pt-28 pb-20 px-6 md:px-12">
      <article className="max-w-[760px] mx-auto">
          {/* Header */}
          <header className="mb-16">
            <p className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4">
              Legal
            </p>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-6">
              Política de <span className="text-omniprise-500">Privacidad</span>
            </h1>
            <p className="text-sm text-text-hint">
              Última actualización: marzo 2026
            </p>
          </header>

          {/* Content */}
          <div className="space-y-12 text-[15px] text-text-secondary leading-relaxed">
            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                1. Responsable del tratamiento
              </h2>
              <p>
                El responsable del tratamiento de los datos personales recopilados a través de este sitio web es{' '}
                <strong className="text-text-primary font-medium">Omniprise S.A.</strong>, con domicilio en la
                ciudad de Asunción, Paraguay. Podés contactarnos a través de{' '}
                <a href="mailto:info@omniprise.com.py" className="text-omniprise-500 hover:text-omniprise-400 transition-colors">
                  info@omniprise.com.py
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                2. Datos que recopilamos
              </h2>
              <p className="mb-4">Recopilamos datos personales que vos proporcionás voluntariamente a través de los formularios de nuestro sitio web:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-text-primary font-medium">Formulario de contacto:</strong> nombre, email, empresa y mensaje.
                </li>
                <li>
                  <strong className="text-text-primary font-medium">Formulario de franquicia:</strong> nombre, apellido, email, teléfono, ciudad, país, marca de interés, experiencia previa, rango de inversión, disponibilidad de local, motivación y cómo nos conociste.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                3. Finalidad del tratamiento
              </h2>
              <p className="mb-4">Utilizamos tus datos personales exclusivamente para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Responder consultas realizadas a través del formulario de contacto.</li>
                <li>Evaluar solicitudes de franquicia y contactar candidatos potenciales.</li>
                <li>Enviar información relevante sobre el proceso de franquicia cuando lo hayas solicitado.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                4. Base legal
              </h2>
              <p>
                El tratamiento de tus datos se basa en tu consentimiento expreso al enviar nuestros formularios.
                Este consentimiento es libre, previo e informado, conforme a lo establecido en la{' '}
                <strong className="text-text-primary font-medium">Constitución Nacional de Paraguay (Art. 33)</strong>{' '}
                sobre el derecho a la intimidad, la{' '}
                <strong className="text-text-primary font-medium">Ley N° 4868/2013 de Comercio Electrónico</strong>{' '}
                y los principios generales de protección de datos personales vigentes en la República del Paraguay.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                5. Terceros con acceso a los datos
              </h2>
              <p>
                Los formularios de este sitio son procesados por{' '}
                <strong className="text-text-primary font-medium">Formspree</strong>, un servicio de procesamiento
                de formularios con sede en Estados Unidos. Los datos enviados a través de los formularios son
                transmitidos a los servidores de Formspree para su posterior reenvío a nuestra dirección de email
                corporativa. Formspree cumple con estándares de seguridad y privacidad reconocidos a nivel internacional.
              </p>
              <p className="mt-4">
                No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                6. Conservación de los datos
              </h2>
              <p>
                Conservamos tus datos personales durante el tiempo necesario para cumplir con la finalidad para la
                que fueron recopilados. Las solicitudes de franquicia se conservan por un plazo máximo de{' '}
                <strong className="text-text-primary font-medium">2 años</strong> desde su recepción, salvo que
                solicites su eliminación antes.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                7. Tus derechos
              </h2>
              <p className="mb-4">Como titular de tus datos personales, tenés derecho a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-text-primary font-medium">Acceso:</strong> solicitar información sobre los datos personales que tenemos sobre vos.</li>
                <li><strong className="text-text-primary font-medium">Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
                <li><strong className="text-text-primary font-medium">Eliminación:</strong> solicitar la eliminación de tus datos personales de nuestros registros.</li>
                <li><strong className="text-text-primary font-medium">Oposición:</strong> oponerte al tratamiento de tus datos en cualquier momento.</li>
                <li><strong className="text-text-primary font-medium">Revocación del consentimiento:</strong> retirar tu consentimiento en cualquier momento sin que ello afecte la licitud del tratamiento previo.</li>
              </ul>
              <p className="mt-4">
                Para ejercer cualquiera de estos derechos, contactanos a través de{' '}
                <a href="mailto:info@omniprise.com.py" className="text-omniprise-500 hover:text-omniprise-400 transition-colors">
                  info@omniprise.com.py
                </a>. Responderemos dentro de los 10 días hábiles.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                8. Seguridad
              </h2>
              <p>
                Implementamos medidas técnicas y organizativas razonables para proteger tus datos personales contra
                accesos no autorizados, pérdida, destrucción o alteración. Nuestro sitio web utiliza cifrado HTTPS
                para la transmisión de datos.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                9. Datos de navegación
              </h2>
              <p>
                Utilizamos <strong className="text-text-primary font-medium">Vercel Analytics</strong> para recopilar
                datos de navegación anónimos y agregados (páginas visitadas, tiempo de permanencia, región general).
                Esta información no identifica personalmente al usuario y se utiliza exclusivamente para mejorar la
                experiencia de navegación en nuestro sitio.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                10. Modificaciones
              </h2>
              <p>
                Nos reservamos el derecho de modificar esta política de privacidad en cualquier momento. Las
                modificaciones entrarán en vigencia a partir de su publicación en este sitio web. Te recomendamos
                revisar esta página periódicamente.
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                11. Contacto
              </h2>
              <p>
                Para cualquier consulta relacionada con esta política de privacidad o el tratamiento de tus datos
                personales, podés contactarnos a través de:
              </p>
              <div className="mt-4 bg-surface-900 border border-border-subtle rounded-xl p-6">
                <p className="text-text-primary font-medium mb-1">Omniprise S.A.</p>
                <p className="text-text-secondary">Asunción, Paraguay</p>
                <p className="text-text-secondary">
                  Email:{' '}
                  <a href="mailto:info@omniprise.com.py" className="text-omniprise-500 hover:text-omniprise-400 transition-colors">
                    info@omniprise.com.py
                  </a>
                </p>
              </div>
            </section>
          </div>
        </article>
    </div>
  );
}
