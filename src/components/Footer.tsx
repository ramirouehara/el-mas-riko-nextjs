import Image from "next/image";

export default function Footer () {
    return (
    <footer className="mt-auto border-t py-12">

        <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between gap-6">

                <div className="text-center md:text-left">
                    <Image src="/img/logo.png" alt="El Mas Riko" width={140} height={68} />

                    <p>
                    Sanguches de milanesa tucumana, como tienen que ser...
                    </p>
                </div>

                <div className="space-y-1 text-center md:text-right">
                    <h5>CONTACTO</h5>
                    <p>Peru 2973</p>
                    <p>381-650-5653</p>
                    <p>Desde 08 AM a 12 PM</p>
                </div>

            </div>
        </div>

        <p className="text-sm border-t text-center mt-8 pt-8">
            &copy; 2026 El Mas Riko. Todos los derechos reservados.
        </p>
    </footer>

    )
}