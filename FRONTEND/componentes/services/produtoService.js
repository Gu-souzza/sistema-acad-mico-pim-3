const ProdutoService = (() => {
    function montarQuery(filtros = {}) {
        const params = new URLSearchParams();

        Object.entries(filtros).forEach(([chave, valor]) => {
            if (valor !== undefined && valor !== null && valor !== "") {
                params.append(chave, valor);
            }
        });

        return params.toString();
    }

    async function listar(filtros = {}) {
        const query = montarQuery(filtros);
        const data = await ZeroFrameApi.request(`/api/produtos${query ? `?${query}` : ""}`);
        return ZeroFrameApi.normalizarLista(data);
    }

    async function buscarPorId(id) {
        return ZeroFrameApi.request(`/api/produtos/${id}`);
    }

    async function listarVariacoes(produtoId) {
        const data = await ZeroFrameApi.request(`/api/produtos/${produtoId}/variacoes`);
        return ZeroFrameApi.normalizarLista(data);
    }

    function getProdutoId(produto) {
        return produto?.id || produto?.Id || produto?.produtoId || produto?.ProdutoId;
    }

    function getCategoria(produto) {
        return produto?.categoria?.nome || produto?.Categoria?.Nome || produto?.categoriaNome || produto?.CategoriaNome || produto?.categoria || produto?.Categoria || "Produto";
    }

    function getMarca(produto) {
        return produto?.marca || produto?.Marca || produto?.origem || produto?.Origem || "Zero Frame";
    }

    function getImagem(produto, caminhoPadrao) {
        const imagem = produto?.imagemUrl || produto?.ImagemUrl || produto?.imagem || produto?.Imagem || produto?.urlImagem || produto?.UrlImagem;
        return ZeroFrameApi.montarUrlArquivo(imagem, caminhoPadrao);
    }

    function getPreco(produto) {
        return Number(produto?.precoFinal || produto?.PrecoFinal || produto?.preco || produto?.Preco || produto?.valor || produto?.Valor || produto?.precoAtual || produto?.PrecoAtual || 0);
    }

    function getEstoque(produto) {
        const variacoes = produto?.variacoes || produto?.Variacoes || [];
        if (Array.isArray(variacoes) && variacoes.length) {
            return variacoes.reduce((total, variacao) => total + Number(variacao?.estoque ?? variacao?.Estoque ?? 0), 0);
        }

        return Number(produto?.estoque ?? produto?.Estoque ?? 0);
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function renderCard(produto, opcoes = {}) {
        return criarCard(produto, opcoes).outerHTML;
    }

    function criarCard(produto, opcoes = {}) {
        const id = getProdutoId(produto);
        const detalheHref = `${opcoes.productPath || "pages/produtos/product.html"}?id=${encodeURIComponent(id)}`;
        const preco = getPreco(produto);
        const precoOriginal = Number(produto?.precoOriginal || produto?.PrecoOriginal || produto?.precoAntigo || produto?.PrecoAntigo || 0);
        const categoria = getCategoria(produto);
        const marca = getMarca(produto);
        const imagem = getImagem(produto, opcoes.fallbackImage || "./assets/products/camisa-over-black.png");
        const saleClass = precoOriginal && precoOriginal > preco ? " product-sale" : "";
        const nome = produto?.nome || produto?.Nome || "Produto Zero Frame";
        const estoque = getEstoque(produto);

        const card = document.createElement(opcoes.tagName || "li");
        card.className = `product-card${saleClass}`;
        card.dataset.produtoId = id || "";

        const link = document.createElement("a");
        link.href = detalheHref;
        link.className = "product-link";

        const image = document.createElement("img");
        image.src = imagem;
        image.alt = nome;
        image.className = "product-image";
        image.onerror = () => {
            image.src = opcoes.fallbackImage || "./assets/products/camisa-over-black.png";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = `${categoria} - ${marca}`;

        const title = document.createElement("h3");
        title.className = "product-name";
        title.textContent = nome;

        info.append(category, title);

        if (precoOriginal && precoOriginal > preco) {
            const discount = document.createElement("p");
            discount.className = "product-discount";
            discount.textContent = formatarPreco(precoOriginal);
            info.appendChild(discount);
        }

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatarPreco(preco);

        const installment = document.createElement("p");
        installment.className = "price-installment";
        installment.textContent = `ou 10x de ${formatarPreco(preco / 10)} sem juros`;

        info.append(price, installment);

        if (estoque > 0) {
            const stock = document.createElement("p");
            stock.className = "product-stock";
            stock.textContent = `Estoque: ${estoque}`;
            info.appendChild(stock);
        }

        link.append(image, info);
        card.appendChild(link);

        return card;
    }

    return {
        listar,
        buscarPorId,
        listarVariacoes,
        getProdutoId,
        getCategoria,
        getMarca,
        getImagem,
        getPreco,
        getEstoque,
        formatarPreco,
        renderCard,
        criarCard
    };
})();
