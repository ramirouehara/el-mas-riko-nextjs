import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic";

export default async function Carta (){
    const categorias = await prisma.categoria.findMany({
        orderBy: { nombre: "asc" },
        include: { productos: true }
    })

    return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold text-center mb-12">NUESTRA CARTA</h1>
            {categorias.map((c) => (
                <div key={c.id} className="mb-10">
                    <h2 className="text-2xl font-bold border-b pb-2 mb-4">{c.nombre}</h2>
                    <ul className="space-y-2">
                        {c.productos.map((p)=> (
                            <li key={p.id} className="flex justify-between">
                                <span>{p.nombre}</span>
                                <span className="font-semibold whitespace-nowrap"> ${p.precio.toString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    )
}