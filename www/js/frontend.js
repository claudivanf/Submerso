$(document).ready(function() {
	
	var DIMENSAO = parseInt($("#dimensao").val());
	var VELOCIDADE = parseInt($("#velocidade").val());
	var NUM_EMBARALHOS = parseInt($("#embaralhos").val());
	var MARGEM = parseInt($("#margem").val());;
	var TAMANHO;
	
	var movimentoLock = false; //desabilita o movimento dos blocos pelo usuário
	
	init();
	
	function movimentar(id, direcao) {
		var bloco = $("#" + id);
		var distancia = TAMANHO + MARGEM;
		switch (direcao) {
			case Direcao.ESQUERDA:
				bloco.animate({
					left:"-=" + distancia + "px"
				}, VELOCIDADE);
				break;
			case Direcao.DIREITA:
				bloco.animate({
					left:"+=" + distancia + "px"
				},  VELOCIDADE);
				break;
			case Direcao.CIMA:
				bloco.animate({
					top:"-=" + distancia + "px"
				}, VELOCIDADE);
				break;
			case Direcao.BAIXO:
				bloco.animate({
					top:"+=" + distancia + "px"
				}, VELOCIDADE);
				break;
		}
	}

	function movimentarAleatoriamente(puzzle, ultimoASerMovimentado) {
		var movimentosPossiveis = puzzle.getMovimentosPossiveis();
		var rand;
		do {
			rand = Math.floor(Math.random() * movimentosPossiveis.length);
		} while (ultimoASerMovimentado == movimentosPossiveis[rand]);
		var blocoASeMovimentar = movimentosPossiveis[rand];
		var direcao = puzzle.move(blocoASeMovimentar);
		movimentar("c" + blocoASeMovimentar, direcao);
		return blocoASeMovimentar;
	}

	function embaralhar(puzzle, numeroVezes, callbackFunction, ultimoASerMovimentado) {
		movimentoLock = true;
		if (numeroVezes <= 0) {
			callbackFunction();
			movimentoLock = false;
			return;
		}
		var blocoMovimentado = movimentarAleatoriamente(puzzle, ultimoASerMovimentado);
		setTimeout(function() {
			embaralhar(puzzle, numeroVezes - 1, callbackFunction, blocoMovimentado);
		}, VELOCIDADE);
	}

	function resolver(puzzle, caminho, callbackFunction) {
		movimentoLock = true;
		if (caminho.length == 0) {
			callbackFunction();
			movimentoLock = false;
			return;
		}
		var blocoASeMovimentar = caminho.shift();
		var direcao = puzzle.move(blocoASeMovimentar);
		movimentar("c" + blocoASeMovimentar, direcao);
		setTimeout(function() {
			resolver(puzzle, caminho, callbackFunction);
		}, VELOCIDADE);
	}
	
	function defineTamanho() {
		var largura = screen.width; 
		var altura = screen.height;
		var dimensao;
		if (largura > altura) {
			dimensao = altura;
		} else { 
			dimensao = largura;
		}
		var porcentagem = parseFloat($("#porcentagem").val());
		var tamanho = dimensao * porcentagem / DIMENSAO;
		TAMANHO = tamanho;
	}
	
	function desenharBlocos() {
		var desenho = "nyan_cat";
		for (var i = 0; i < DIMENSAO; i++) {
			for (var j = 0; j < DIMENSAO; j++) {
				//diferente do ultimo elemento
				if (!(i == DIMENSAO - 1 && j == DIMENSAO - 1)) {
					var id = i * DIMENSAO + j + 1;
					var htmlImg = "<img src='img/" + desenho + "/parte" + id + ".gif' />";
					var htmlNumero = "<p style='position: absolute; right: 0; left: 0; margin: auto; color: rgba(255, 255, 255, 0);'>" + id + "</p>";
					var htmlDiv = "<div id='c" + id + "'>" + htmlNumero + htmlImg + "</div>";
					$("#container").append(htmlDiv);
					var elemento = $("#c" + id);
					elemento.css("left", j * (TAMANHO + MARGEM));
					elemento.css("top", i * (TAMANHO + MARGEM));
					elemento.css("width", TAMANHO + "px");
					elemento.css("height", TAMANHO + "px");
					elemento.css("font-size", TAMANHO * 0.7);
				} 
			}
			$("#container").append("<br/>");
		}
		$("#container").css("width", (TAMANHO + MARGEM) * DIMENSAO);
		$("#container").css("height", (TAMANHO + MARGEM) * DIMENSAO);	
	}

	function diminuiTempoCronometro(cronometro, tempoRestante, funcaoPerderJogo) {
		if (cronometro.pausado()) {
			return;
		} else if (cronometro.tempoEsgotado()) {
			funcaoPerderJogo();
			return;
		}
		cronometro.diminuiTempo();
		tempoRestante.css("width", cronometro.tempoRestante() * 100 + "%");
		setTimeout(function() {
			diminuiTempoCronometro(cronometro, tempoRestante, funcaoPerderJogo);
		}, 1000);
	}
	
	function esconderNumeros(opacidade) {
		opacidade = opacidade || 1.0;
		if (opacidade <= 0) return;
		for (var i = 1; i < Math.pow(DIMENSAO, 2); i++) {
			var texto = $("#c" + i + " p");
			texto.css("color", "rgba(255, 255, 255, " + opacidade + ")");
		}
		setTimeout(function() {
			esconderNumeros(opacidade - 0.01);
		}, 20);
	}
	
	function mostrarNumeros(opacidade) {
		opacidade = opacidade || 0;
		if (opacidade >= 1.0) {
			var duracaoNumeros = parseInt($("#duracao-numeros").val());
			setTimeout(function() {
				esconderNumeros();
			}, duracaoNumeros);
			return;
		}
		for (var i = 1; i < Math.pow(DIMENSAO, 2); i++) {
			var texto = $("#c" + i + " p");
			texto.css("color", "rgba(255, 255, 255, " + opacidade + ")");
		}
		setTimeout(function() {
			mostrarNumeros(opacidade + 0.01);
		}, 20);
	}
		
	function init() {
		defineTamanho();
		//inicia
		var puzzle = new Puzzle(DIMENSAO);
		desenharBlocos();
		
		//embaralha
		var funcaoEmbaralhar = function(callbackFunction) {
			embaralhar(puzzle, NUM_EMBARALHOS, callbackFunction);
		};
		
		//resolve
		var funcaoResolver = function(callbackFunction) {
			var caminho = puzzle.resolve();
			resolver(puzzle, caminho, callbackFunction);
		};
		
		//move
		$("#container div").on("click", function() {
			if (!movimentoLock) {
				var id = $(this).attr("id");
				var num = parseInt(id.slice(1));
				var direcao = puzzle.move(num);
				if (direcao != null) {
					movimentar(id, direcao);
					//se está resolvido, vence o jogo
					if (puzzle.estaResolvido()) {
						funcaoVencerJogo();
					}
				}
			}
		});
		
		//reinicia o jogo 
		var funcaoReinicia = function() {
			$("#tela-derrota").hide();
			$("#tela-vencer").hide();
			$(".mostrar-numero").removeAttr("disabled");
			puzzle.reinicia();
			funcaoEmbaralhar(function() {
				cronometro.reinicia();
				diminuiTempoCronometro(cronometro, tempoRestante, funcaoPerderJogo);
			});
		};
		$(".reiniciar-jogo").on("click", funcaoReinicia);
		
		//perde o jogo
		$("#tela-derrota").hide();
		var funcaoPerderJogo = function() {
			cronometro.pausa();
			funcaoResolver(function() {
				$("#tela-derrota").show();
			});
		};
		
		//vence o jogo
		$("#tela-vencer").hide();
		var funcaoVencerJogo = function() {
			cronometro.pausa();
			$("#tela-vencer h2").text("Você venceu em " + (puzzle.getQuantMovimentos() - NUM_EMBARALHOS) + " passos!");
			$("#tela-vencer").show();
		}
		
		//cronometro 
		var tempoTotal = parseInt($("#tempo-total").val());
		var tempoRestante = $("#tempo-restante");
		var cronometro = new Cronometro(tempoTotal);
		
		funcaoEmbaralhar(function() {
			diminuiTempoCronometro(cronometro, tempoRestante, funcaoPerderJogo);
		});
		
		//mostra os numeros
		$(".mostrar-numero").on("click", function() {
			$(this).attr("disabled", "disabled");
			mostrarNumeros();
		});
		
		//mutar 
		$(".mutar").on("click", function() {
			if ($(this).data("mutado") == "true") {
				$(this).find("i").removeClass("fa-bell-slash");
				$(this).find("i").addClass("fa-bell");
				$(this).data("mutado", "false");
			} else {
				$(this).find("i").removeClass("fa-bell");
				$(this).find("i").addClass("fa-bell-slash");
				$(this).data("mutado", "true");
			}	
		});
	}
	
});
