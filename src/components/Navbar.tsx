import Image from "next/image";
import Link from "next/link";


export default function Navbar() {
    return(
        <nav className="flex items-center justify-between px-4 py-3">
            <Link href="/">
                <Image src="/img/logo.png" alt="El Mas Riko" width={140} height={68} />
            </Link>

            <ul className="flex items-center gap-3">
                <li>
                    <Link href="/">Inicio</Link>
                </li>
                <li>
                    <Link href="/#nosotros">Nosotros</Link>
                </li>
                <li>
                    <Link href="/#especialidades">Productos</Link>
                </li>
                <li>
                    <Link href="/carta">Carta</Link>
                </li>
                <li>
                    <Link href="/pedidos">Pedido</Link>
                </li>
                <li>
                    <Link href="/login">Empleados</Link>
                </li>
            </ul>

        </nav>
    );
}
