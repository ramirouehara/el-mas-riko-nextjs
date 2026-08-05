"use server"
import { prisma } from "@/lib/prisma";

export async function crearPedido(formData: FormData) {
    
    
    const nombre = String(formData.get("nombre"));
    const telefono = String(formData.get("telefono"));
    const direccion = String(formData.get("direccion"));
    const productoId = Number(formData.get("productoId"));
    const cantidad = Number(formData.get("cantidad"));
    
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });

    if(!producto) {
        throw new Error("Producto no encontrado");
    }

    const precio = Number(producto.precio);
    const total = precio * cantidad;

    const cliente = await prisma.cliente.create({
    data: { 
        nombre: nombre, 
        telefono: telefono, 
        direccion: direccion 
    },
    });

    const pedido = await prisma.pedido.create({
        data: { 
            clienteId: cliente.id, 
            total: total 
        },
    });

    await prisma.detallePedido.create({
        data: { 
            pedidoId: pedido.id, 
            productoId: productoId, 
            cantidad: cantidad, 
            precioUnitario: precio
         },
    });
};
