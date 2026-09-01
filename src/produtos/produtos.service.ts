import { Injectable } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  private produtos: any[] = []; // "banco de dados" em memória
  private idAtual = 1;

  create(createProdutoDto: CreateProdutoDto) {
    const novoProduto = { id: this.idAtual++, ...createProdutoDto };
    this.produtos.push(novoProduto);
    return novoProduto;
  }

  findAll() { 
    return this.produtos.map(({ id, ...resto }) => resto); 
  }

  findOne(id: number) {
    return this.produtos.find((produto) => produto.id === id);
  }

  update(id: number, updateProdutoDto: UpdateProdutoDto) {
    const index = this.produtos.findIndex((produto) => produto.id === id);
    if (index === -1) return null;
    this.produtos[index] = { ...this.produtos[index], ...updateProdutoDto };
    return this.produtos[index];
  }

  remove(id: number) {
    const index = this.produtos.findIndex((produto) => produto.id === id);
    if (index === -1) return null;
    this.produtos.splice(index, 1);
    return { mensagem: `Produto ${id} removido` };
  }
}