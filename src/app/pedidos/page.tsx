import { prisma } from "@/lib/prisma"
import Form from "@/components/FormPedido";

export const dynamic = "force-dynamic";

export default async function Pedidos () {

    const categorias = await prisma.categoria.findMany({
        orderBy: { nombre: "asc" },
        include: { productos: true }
    })

    const categoriasPlanas = categorias.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        productos: c.productos.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            categoriaId: p.categoriaId,
            precio: Number(p.precio),
        })),
    }));



    return (
        <>
            <Form categorias={categoriasPlanas} />
        </>
    )
}