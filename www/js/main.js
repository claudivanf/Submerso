
$(document).ready(function() {
	
	init();
	
	function init() {
		//------------------------------------------------
		// CONSTANTES DEFINIDAS NO HTML
		//------------------------------------------------
		var dimensao = parseInt($("#dimensao").val());
		var velocidade = parseInt($("#velocidade").val());
		var numEmbaralhos = parseInt($("#embaralhos").val());
		var margem = parseInt($("#margem").val());
		var porcentagem = parseFloat($("#porcentagem").val());
		var tempoTotal = parseInt($("#tempo-total").val());
		var duracaoNumeros = parseInt($("#duracao-numeros").val());
		
		//------------------------------------------------
		// VARIÁVEIS DO JOGO 
		//------------------------------------------------
		var tamanho = getTamanhoBloco(porcentagem, dimensao);
		var blocos = desenharBlocos("nyan_cat", tamanho, dimensao, margem);
		var puzzle = new Puzzle(dimensao);
		var jogo = new Jogo(puzzle, blocos, velocidade, numEmbaralhos);
		var barra = $("#tempo-restante");
		var cronometro = new Cronometro(tempoTotal, barra, perderJogo);
		
		//------------------------------------------------
		// AÇÕES
		//------------------------------------------------
		//Ação inicial
		jogo.embaralha(function() {
			cronometro.reinicia();
		});
		$("#tela-vencer").hide();
		$("#tela-derrota").hide();
		
		//Movimentação 
		function moverBloco(bloco) {
			//Permite a movimentação apenas se o cronômetro não estiver pausado 
			if (!cronometro.isPausado()) {
				jogo.move(bloco);
				if (puzzle.estaResolvido()) {
					vencerJogo();
				}
			}
		};
		for (var i = 0; i < blocos.length; i++) {
			var bloco = blocos[i];
			bloco.elemento.on("click", function() {
				var num = parseInt($(this).attr("id").substring(1));
				moverBloco(num);
			});
		}
		
		//Vencer jogo 
		function vencerJogo() {
			cronometro.pausa();
			$("#tela-vencer h2").text("Você venceu em " + (puzzle.getQuantMovimentos() - numEmbaralhos) + " passos!");
			$("#tela-vencer").show();
		};
		
		//Perder jogo 
		function perderJogo() {
			cronometro.pausa();
			jogo.resolve(function() {
				$("#tela-derrota").show();
			});
		};
		
		//Reiniciar jogo 
		function reiniciarJogo() {
			$("#tela-derrota").hide();
			$("#tela-vencer").hide();
			$(".mostrar-numero").removeAttr("disabled");
			puzzle.reinicia();
			jogo.embaralha(function() {
				cronometro.reinicia();
			});
		};
		$(".reiniciar-jogo").on("click", reiniciarJogo);
		
		//Mostrar os números
		function mostrarNumeros(opacidade, esconder) {
			if (opacidade < 0) return;
			//Muda a opacidade dos números
			for (var i = 1; i < Math.pow(dimensao, 2); i++) {
				var texto = $("#c" + i + " p");
				texto.css("color", "rgba(255, 255, 255, " + opacidade + ")");
			}
			//Define a nova opacidade e o próximo intervalo de tempo dependendo de certos estados
			var novaOpacidade;
			var proximoTempo;
			//Diminui a opacidade gradativamente
			if (esconder) {
				novaOpacidade = opacidade - 0.01;
				proximoTempo = 20;
			} else {
				//Já chegou ao máximo de opacidade. Começar agora o processo de esconder
				if (opacidade >= 1) {
					novaOpacidade = 1.0;
					proximoTempo = duracaoNumeros * 1000;
					esconder = true;
				//Aumenta a opacidade gradativamente 
				} else {
					novaOpacidade = opacidade + 0.01;
					proximoTempo = 20;
				}
			}
			setTimeout(function() {
				mostrarNumeros(novaOpacidade, esconder);
			}, proximoTempo);
		};
		$(".mostrar-numero").on("click", function() {
			$(this).attr("disabled", "disabled");
			mostrarNumeros(0, false);
		});
		
		//Mutar 
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
	};

});