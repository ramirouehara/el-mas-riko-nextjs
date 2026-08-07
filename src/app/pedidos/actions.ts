"use server"
import { prisma } from "@/lib/prisma";
type Estado = { mensaje: string }

export async function crearPedido(estadoPrevio: Estado, formData: FormData): Promise<Estado> {
    
    
    const nombre = String(formData.get("nombre"));
    const telefono = String(formData.get("telefono"));
    const direccion = String(formData.get("direccion"));
    const productoId = Number(formData.get("productoId"));
    const cantidad = Number(formData.get("cantidad"));
    
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });

    if(!producto) {
        return {
            mensaje: "Producto no encontrado"
        }
    }

    const precio = Number(producto.precio);
    const total = precio * cantidad;


    await prisma.$transaction(async (tx)=>{
        
        const cliente = await tx.cliente.create({
        data: { 
            nombre: nombre, 
            telefono: telefono, 
            direccion: direccion 
        },
        });
    
        const pedido = await tx.pedido.create({
            data: { 
                clienteId: cliente.id, 
                total: total 
            },
        });
    
        await tx.detallePedido.create({
            data: { 
                pedidoId: pedido.id, 
                productoId: productoId, 
                cantidad: cantidad, 
                precioUnitario: precio
             },
        });

    })
    return { mensaje: "Pedido Creado!" }
    

};
