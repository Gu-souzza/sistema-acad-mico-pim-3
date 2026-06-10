document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const buscaInicial = params.get("q") || "";
    const title = document.querySelector(".search-title");
    const results = document.querySelector(".search-results.products-container");
    const filtros = document.querySelector(".search-filters");

    aplicarFiltrosDaUrl(params);
    if (title) title.textContent = buscaInicial ? `Resultados para "${buscaInicial}"` : "Produtos";

    carregarResultados(buscaInicial);

    if (filtros) {
        filtros.addEventListener("change", () => carregarResultados(buscaInicial, { atualizarUrl: true }));
    }

    async function carregarResultados(busca, opcoes = {}) {
        if (!results) return;

        try {
            ZeroFrameApi.mostrarCarregando(results, "Buscando produtos...");
            const filtrosAtuais = montarFiltros(busca);
            if (opcoes.atualizarUrl) atualizarQueryString(filtrosAtuais);

            const produtos = await ProdutoService.listar(filtrosAtuais);
            if (!produtos.length) {
                ZeroFrameApi.mostrarMensagem(results, "Nenhum produto encontrado para essa busca.");
                return;
            }

            results.textContent = "";
            produtos.forEach((produto) => {
                results.appendChild(ProdutoService.criarCard(produto, {
                    productPath: "../../pages/produtos/product.html",
                    fallbackImage: "../../assets/products/camisa-over-black.png"
                }));
            });
        } catch (error) {
            ZeroFrameApi.mostrarMensagem(results, ZeroFrameApi.tratarErro(error, "Erro ao buscar produtos."));
        }
    }
});

function montarFiltros(busca) {
    const filtros = {};
    const checked = Array.from(document.querySelectorAll(".search-filters input:checked"));

    if (busca) filtros.Busca = busca;

    checked.forEach((input) => {
        const valor = input.value || input.nextElementSibling?.textContent?.trim();
        if (!valor) return;

        if (input.id === "preco1") {
            filtros.PrecoMax = 100;
        } else if (input.id === "preco2") {
            filtros.PrecoMin = 100;
            filtros.PrecoMax = 200;
        } else if (input.id === "preco3") {
            filtros.PrecoMin = 200;
            filtros.PrecoMax = 300;
        } else if (input.id === "preco4") {
            filtros.PrecoMin = 300;
        } else if (["masculino", "feminino", "unisex"].includes(input.id)) {
            filtros.Genero = normalizarGenero(valor);
        } else if (["tam-p", "tam-m", "tam-g", "tam-gg"].includes(input.id)) {
            filtros.Tamanho = valor;
        } else if (input.id.startsWith("cor-")) {
            filtros.Cor = valor;
        } else if (input.id.startsWith("cat-")) {
            filtros.Categoria = valor;
        }
    });

    return filtros;
}

function normalizarGenero(valor) {
    const genero = String(valor || "").trim().toLowerCase();
    if (genero === "unisex" || genero === "unissex") return "Unissex";
    if (genero === "masculino") return "Masculino";
    if (genero === "feminino") return "Feminino";
    return valor;
}

function aplicarFiltrosDaUrl(params) {
    const mapa = {
        Genero: { Masculino: "masculino", Feminino: "feminino", Unissex: "unisex", Unisex: "unisex" },
        Tamanho: { P: "tam-p", M: "tam-m", G: "tam-g", GG: "tam-gg" },
        Cor: {
            Branco: "cor-branco",
            Preto: "cor-preto",
            Azul: "cor-azul",
            Verde: "cor-verde",
            Vermelho: "cor-vermelho",
            Amarelo: "cor-amarelo"
        },
        Categoria: {
            Camisas: "cat-camisas",
            Blusas: "cat-blusas",
            Calcas: "cat-calcas",
            "Calças": "cat-calcas",
            Bermudas: "cat-bermudas",
            Calcados: "cat-calcados",
            "Calçados": "cat-calcados",
            Acessorios: "cat-acessorios",
            "Acessórios": "cat-acessorios"
        }
    };

    Object.entries(mapa).forEach(([param, valores]) => {
        const valor = params.get(param);
        const id = valores[valor];
        if (id) {
            const input = document.getElementById(id);
            if (input) input.checked = true;
        }
    });

    const precoMin = params.get("PrecoMin");
    const precoMax = params.get("PrecoMax");
    const precoId = precoMax === "100" ? "preco1"
        : precoMin === "100" && precoMax === "200" ? "preco2"
        : precoMin === "200" && precoMax === "300" ? "preco3"
        : precoMin === "300" ? "preco4"
        : "";

    if (precoId) {
        const input = document.getElementById(precoId);
        if (input) input.checked = true;
    }
}

function atualizarQueryString(filtros) {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== "") params.set(chave, valor);
    });

    const query = params.toString();
    const novaUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
    window.history.replaceState({}, "", novaUrl);
}
