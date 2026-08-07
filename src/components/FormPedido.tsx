"use client"

import { crearPedido } from "@/app/pedidos/actions";
import { useActionState } from "react";

type ProductoPlano = { id: number; nombre: string; precio: number; categoriaId: number };
type CategoriaConProductos = { id: number; nombre: string; productos: ProductoPlano[] };


export default function Form ({ categorias }: { categorias: CategoriaConProductos[] }) {

    const estadoInicial = { mensaje: "" };
    const [estado, accion, pendiente] = useActionState(crearPedido, estadoInicial)

    return (
        <form action={accion}>
            <input type="text" name="nombre" placeholder="Nombre"/>
            <input type="text" name="telefono" placeholder="Telefono"/>
            <input type="text" name="direccion" placeholder="Direccion"/>
            <select name="categoriaId">
                {categorias.map((c)=>(
                <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
            </select>
            <select name="productoId">
                {categorias.map((c)=>(
                    c.productos.map((p)=>(
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))
                ))}
            </select>
            <input type="number" name="cantidad"/>
            <button type="submit" disabled={pendiente}>Hacer Pedido!</button>
            {estado.mensaje}    
        </form>    

    )
};