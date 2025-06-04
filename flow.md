# Especificação Técnica do Sistema de Caixa Surpresa - Versão Final

## Parâmetros Gerais do Sistema

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| Preço em tokens ADR | $45,00 | Valor em tokens ADR que serão queimados ao abrir a caixa |
| Fee em SOL | 0,046364 SOL ($7,65) | Taxa em SOL que será paga ao abrir a caixa (receita direta) |
| Preço total da caixa | $52,65 | Valor total pago pelo usuário (ADR + SOL) |
| Número de caixas no lançamento | 200-350 | Quantidade limitada de caixas disponíveis |
| Valor esperado por caixa | $51,93 | Valor médio dos prêmios por caixa |
| Margem de lucro | +1,36% | Margem de lucro do sistema após ajuste de preço |

## Tabela de Prêmios e Probabilidades

| ID | Prêmio | Valor (USD) | Probabilidade | Frequência | Estoque Disponível | Unidades Esperadas (275 caixas) |
|----|--------|-------------|---------------|------------|-------------------|--------------------------------|
| 1 | 0,01 SOL | $1,65 | 20,8636% | 1 em 4,8 | Ilimitado | 57,4 |
| 2 | 0,05 SOL | $8,25 | 12,5182% | 1 em 8,0 | Ilimitado | 34,4 |
| 3 | 0,1 SOL | $16,50 | 6,2591% | 1 em 16,0 | Ilimitado | 17,2 |
| 4 | 0,3 SOL | $49,50 | 2,0864% | 1 em 47,9 | Ilimitado | 5,7 |
| 5 | NFT Comum do Adriano | $0,50 | 22,2545% | 1 em 4,5 | Ilimitado | 61,2 |
| 6 | NFT Rara do Adriano | $10,00 | 4,1727% | 1 em 24,0 | Ilimitado | 11,5 |
| 7 | NFT Lendária do Adriano | $30,00 | 1,3909% | 1 em 71,9 | Ilimitado | 3,8 |
| 8 | Camisas de time | $66,67 | 15,0000% | 1 em 6,7 | 90 | 41,2 |
| 9 | Bolas oficiais | $78,95 | 8,0000% | 1 em 12,5 | 40 | 22,0 |
| 10 | Chuteiras | $87,72 | 6,0000% | 1 em 16,7 | 30 | 16,5 |
| 11 | MacBook M3 | $4.017,54 | 0,3636% | 1 em 275,0 | 1 | 1,0 |
| 12 | iPhone 16 Pro Max | $1.561,40 | 0,7273% | 1 em 137,5 | 2 | 2,0 |
| 13 | Ticket Dourado | N/A | 0,3636% | 1 em 275,0 | 10 | 1,0 |

## Instruções para Implementação

### 1. Estrutura de Pagamento Híbrido

```
function abrirCaixa(userAddress) {
    // 1. Cobrar tokens ADR
    const tokenAmount = calculateADRAmount(45.00);  // $45,00 em tokens ADR
    burnTokens(userAddress, tokenAmount);
    
    // 2. Cobrar fee em SOL
    const solFee = 0.046364;  // 0,046364 SOL ($7,65)
    collectSolFee(userAddress, solFee);
    
    // 3. Determinar prêmio
    const premio = determinarPremio();
    
    // 4. Entregar prêmio ao usuário
    entregarPremio(userAddress, premio);
}
```

### 2. Algoritmo para Determinar Prêmio

```
function determinarPremio() {
    // Gerar número aleatório entre 0 e 1
    const random = generateSecureRandom();
    
    // Array com limites cumulativos de probabilidade
    const probabilidadesCumulativas = [
        0.208636,                    // 0,01 SOL
        0.208636 + 0.125182,         // 0,05 SOL
        0.208636 + 0.125182 + 0.062591,  // 0,1 SOL
        0.208636 + 0.125182 + 0.062591 + 0.020864,  // 0,3 SOL
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545,  // NFT Comum
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727,  // NFT Rara
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909,  // NFT Lendária
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909 + 0.150000,  // Camisas
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909 + 0.150000 + 0.080000,  // Bolas
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909 + 0.150000 + 0.080000 + 0.060000,  // Chuteiras
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909 + 0.150000 + 0.080000 + 0.060000 + 0.003636,  // MacBook
        0.208636 + 0.125182 + 0.062591 + 0.020864 + 0.222545 + 0.041727 + 0.013909 + 0.150000 + 0.080000 + 0.060000 + 0.003636 + 0.007273,  // iPhone
        1.0  // Ticket Dourado
    ];
    
    // Determinar o prêmio com base no número aleatório
    for (let i = 0; i < probabilidadesCumulativas.length; i++) {
        if (random < probabilidadesCumulativas[i]) {
            return i + 1;  // Retorna o ID do prêmio (1-13)
        }
    }
}
```

### 3. Verificação de Estoque para Prêmios Físicos

```
function verificarEstoque(premioId) {
    const estoques = {
        8: 90,   // Camisas de time
        9: 40,   // Bolas oficiais
        10: 30,  // Chuteiras
        11: 1,   // MacBook M3
        12: 2,   // iPhone 16 Pro Max
        13: 10   // Ticket Dourado
    };
    
    // Se não for prêmio físico, não precisa verificar estoque
    if (premioId < 8) return true;
    
    // Verificar se ainda há estoque disponível
    if (estoques[premioId] > 0) {
        estoques[premioId]--;  // Reduzir estoque
        return true;
    }
    
    // Se não houver estoque, sortear outro prêmio
    return false;
}
```

### 4. Tratamento de Jackpots (MacBook e Ticket Dourado)

```
function entregarPremio(userAddress, premioId) {
    // Tratamento especial para jackpots
    if (premioId == 11 || premioId == 13) {  // MacBook ou Ticket Dourado
        // Registrar em log especial
        registrarJackpot(userAddress, premioId);
        
        // Notificar administradores
        notificarAdministradores(userAddress, premioId);
        
        // Iniciar processo de verificação KYC
        iniciarProcessoKYC(userAddress);
    }
    
    // Entregar o prêmio conforme seu tipo
    switch(premioId) {
        case 1: case 2: case 3: case 4:
            // Prêmios em SOL
            enviarSOL(userAddress, valorSOL[premioId-1]);
            break;
        case 5: case 6: case 7:
            // NFTs
            mintNFT(userAddress, tipoNFT[premioId-5]);
            break;
        case 8: case 9: case 10: case 11: case 12: case 13:
            // Prêmios físicos - gerar voucher
            gerarVoucher(userAddress, premioId);
            break;
    }
}
```

## Notas Importantes para o Desenvolvedor

1. **Raridade dos Jackpots:**
   - O MacBook e o Ticket Dourado têm exatamente a mesma raridade (0,3636% ou 1 em 275 caixas)
   - Embora haja 10 tickets dourados disponíveis no estoque, a probabilidade é calculada para que, em média, apenas 1 ticket seja distribuído durante todo o lançamento
   - Os 9 tickets adicionais funcionam apenas como um "teto de segurança" para o caso improvável de mais de um sortudo ganhar este prêmio ultra-raro

2. **Verificação de Estoque:**
   - É crucial implementar um sistema robusto de verificação de estoque para prêmios físicos
   - Se um prêmio físico estiver esgotado, o sistema deve automaticamente sortear outro prêmio
   - Manter um registro em tempo real do estoque disponível

3. **Geração de Números Aleatórios:**
   - Utilizar um método criptograficamente seguro para geração de números aleatórios
   - Considerar implementar um sistema de verificabilidade (provably fair) para aumentar a transparência

4. **Limitação de Caixas:**
   - Implementar um contador global para limitar o número total de caixas entre 200-350
   - Exibir claramente para os usuários quantas caixas ainda estão disponíveis

5. **Tratamento de Erros:**
   - Implementar tratamento adequado para falhas de pagamento (tanto em ADR quanto em SOL)
   - Garantir que os tokens ADR sejam queimados apenas após a confirmação da transação em SOL

6. **Monitoramento:**
   - Implementar sistema de logs detalhados para todas as aberturas de caixas
   - Criar dashboard para acompanhamento em tempo real da distribuição de prêmios
   - Configurar alertas para quando jackpots forem ganhos

## Projeção Financeira

| Métrica | Valor |
|---------|-------|
| Valor total esperado dos prêmios (275 caixas) | $14.281,55 |
| Receita total esperada (275 caixas) | $14.478,75 |
| - Receita em tokens ADR (queimados) | $12.375,00 |
| - Receita em SOL (fee) | $2.103,75 |
| Lucro total esperado | $197,20 |
| Margem de lucro | +1,36% |

Esta especificação técnica contém todos os parâmetros e instruções necessários para implementar o sistema de caixa surpresa com pagamento híbrido e jackpots ultra-raros, conforme solicitado.
