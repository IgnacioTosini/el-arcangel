import Image from 'next/image';
import Link from 'next/link';
import './_hero.scss';

export default function Hero() {
    return (
        <section className="heroContent" aria-labelledby="heroTitle">
            <div className='heroInner'>
                <h1 id="heroTitle" className='heroTitle'>Encontrá ese detalle especial</h1>
                <p className='heroSubtitle'>Santería y regalería. Venta por mayor y menor.</p>
                <div className='heroButtons'>
                    <Link href="/catalogo" className='heroButton'>Explorar catálogo</Link>
                    <Link href="/mayoristas" className='heroButton heroButtonSecondary'>Consultar por mayor</Link>
                </div>
            </div>
            <picture className='heroPicture'>
                <Image src="/heroImage.jpg" alt="Sahumerios encendidos, una figura decorativa y lavanda sobre una mesa" className="heroImage" width={600} height={400} sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 48vw, 596px" priority />
            </picture>
        </section>
    )
}
