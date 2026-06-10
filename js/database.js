const METODO_3P_DATABASE = {
  "checklists": {
    "cozinha": {
      "name": "Cozinha",
      "emoji": "🍳",
      "description": "Planejamento hidráulico, tomadas robustas e revestimento lavável.",
      "planejar": [
        {
          "id": "coz-pl-1",
          "title": "Triângulo de Trabalho",
          "desc": "Planeje o layout garantindo o triângulo funcional: Fogão ➔ Pia ➔ Geladeira. Evite barreiras no caminho."
        },
        {
          "id": "coz-pl-2",
          "title": "Locação de Tomadas dedicadas",
          "desc": "Marque tomadas exclusivas de 20A para aparelhos de alta potência: Microondas, Forno, Cooktop, Geladeira e Máquina de Lavar Louça."
        },
        {
          "id": "coz-pl-3",
          "title": "Pontos de Água e Filtro",
          "desc": "Defina a altura do ponto de água da torneira (geralmente 1,10m) e o ponto extra de água para o filtro/geladeira side-by-side."
        },
        {
          "id": "coz-pl-4",
          "title": "Altura de Bancada e Iluminação",
          "desc": "Defina a altura da bancada (média de 88cm a 92cm do piso acabado) e preveja iluminação de tarefa focada sob os armários aéreos."
        }
      ],
      "prevenir": [
        {
          "id": "coz-pr-1",
          "title": "Impermeabilização da Base de Alvenaria",
          "desc": "Aplique argamassa polimérica na base de todas as paredes até 30cm de altura para evitar umidade ascendente que estraga armários."
        },
        {
          "id": "coz-pr-2",
          "title": "Teste de Pressão Hidráulica",
          "desc": "Pressurize os canos de água quente/fria por 24 horas antes de rebocar ou fechar a parede para garantir que não haja microvazamentos."
        },
        {
          "id": "coz-pr-3",
          "title": "Verificação de Caimento de Esgoto",
          "desc": "Garanta caimento mínimo de 1% a 2% na tubulação de esgoto da pia para evitar acúmulo de gordura e entupimentos frequentes."
        }
      ],
      "proteger": [
        {
          "id": "coz-pt-1",
          "title": "Rejuntamento Impermeável na Bancada",
          "desc": "Utilize rejunte acrílico ou epóxi no frontão da pia (rodabanca). O rejunte cimentício comum absorve gordura e mofa rapidamente."
        },
        {
          "id": "coz-pt-2",
          "title": "Disjuntores Dedicados no Quadro",
          "desc": "Instale disjuntores termomagnéticos individuais de amperagem adequada para Forno Elétrico e Cooktop elétrico."
        },
        {
          "id": "coz-pt-3",
          "title": "Calafetação de Rodapia com Silicone PU",
          "desc": "Aplique silicone de poliuretano (PU) anti-mofo no encontro da bancada com a parede para vedação 100% estanque."
        }
      ]
    },
    "banheiro": {
      "name": "Banheiro",
      "emoji": "🛁",
      "description": "Área altamente úmida. O maior risco de infiltrações e retrabalho da obra.",
      "planejar": [
        {
          "id": "ban-pl-1",
          "title": "Eixo do Vaso Sanitário",
          "desc": "Posicione o vaso respeitando a distância mínima de 30cm a 35cm das paredes laterais ao eixo central do cano de esgoto de 100mm."
        },
        {
          "id": "ban-pl-2",
          "title": "Nicho do Box Sem Danos Estruturais",
          "desc": "Defina o local do nicho em parede que não possua pilares, vigas ou prumada hidráulica principal."
        },
        {
          "id": "ban-pl-3",
          "title": "Altura de Ponto de Chuveiro",
          "desc": "Marque a saída de água do chuveiro a uma altura confortável de 2,10m a 2,20m em relação ao piso acabado."
        },
        {
          "id": "ban-pl-4",
          "title": "Iluminação dedicada no Box",
          "desc": "Preveja ponto de iluminação com arandela ou spot blindado (IP65 contra vapor) dentro da área do box."
        }
      ],
      "prevenir": [
        {
          "id": "ban-pr-1",
          "title": "Impermeabilização Estrutural do Box",
          "desc": "Aplique 3 demãos cruzadas de argamassa polimérica em todo o chão do banheiro, subindo 1,50m nas paredes do box e 30cm fora dele."
        },
        {
          "id": "ban-pr-2",
          "title": "Teste de Estanqueidade do Ralo (72h)",
          "desc": "Feche o ralo do box com teste inflável, encha o chão com água até 5cm e marque o nível. Aguarde 72h para vistoriar vazamentos abaixo."
        },
        {
          "id": "ban-pr-3",
          "title": "Declividade do Ralo do Box",
          "desc": "Exija do pedreiro caimento de 1% a 2% direcionado exclusivamente ao ralo, evitando poças de água nas pontas do box."
        }
      ],
      "proteger": [
        {
          "id": "ban-pt-1",
          "title": "Vedação do Anel de Cera do Vaso",
          "desc": "Instale o vaso sanitário com anel de cera de vedação de boa qualidade para bloquear 100% de odores vindos do esgoto."
        },
        {
          "id": "ban-pt-2",
          "title": "Rejuntamento Epóxi no Box",
          "desc": "Utilize rejuntamento epóxi no chão e nas paredes internas do box. Ele é impermeável, não encarde e previne infiltrações na laje."
        },
        {
          "id": "ban-pt-3",
          "title": "Ralo Click com Grelha Abre-Fecha",
          "desc": "Instale ralos inteligentes que bloqueiam a entrada de insetos e previnem retorno de gases fétidos."
        }
      ]
    },
    "sala": {
      "name": "Sala",
      "emoji": "📺",
      "description": "Conforto acústico, passagem de cabos e iluminação cênica.",
      "planejar": [
        {
          "id": "sal-pl-1",
          "title": "Tubulações de Passagem de Cabos (Eletroduto)",
          "desc": "Preveja eletrodutos largos de 1 polegada ligando a TV até a altura do rack para esconder cabos HDMI, rede e energia."
        },
        {
          "id": "sal-pl-2",
          "title": "Iluminação Cênica em Circuitos separados",
          "desc": "Separe a iluminação geral de teto da iluminação decorativa (fita de LED em sanca, spots direcionais em quadros e pendentes)."
        },
        {
          "id": "sal-pl-3",
          "title": "Ponto de Ar Condicionado",
          "desc": "Defina o local da evaporadora de ar condicionado distante da cabeça do sofá e preveja dreno de gravidade e tubos de cobre."
        }
      ],
      "prevenir": [
        {
          "id": "sal-pr-1",
          "title": "Inspeção de infiltrações de Janela",
          "desc": "Antes de pintar ou emassar, vistorie a pingadeira da janela externa e faça calafetação com selante elástico de poliuretano (PU)."
        },
        {
          "id": "sal-pr-2",
          "title": "Nivelamento de Contrapiso",
          "desc": "Verifique o nível do contrapiso com nível laser antes de comprar pisos laminados, vinílicos ou porcelanatos de grande formato."
        }
      ],
      "proteger": [
        {
          "id": "sal-pt-1",
          "title": "Dispositivo de Proteção contra Surtos (DPS)",
          "desc": "Instale módulos DPS no quadro elétrico da residência para proteger TVs, videogames e aparelhos caros contra quedas de raios."
        },
        {
          "id": "sal-pt-2",
          "title": "Proteção de Piso após Assentamento",
          "desc": "Cubra todo o porcelanato ou piso de madeira assentado com Salva-Piso (papelão ondulado com plástico bolha) até o fim da obra."
        }
      ]
    },
    "quarto": {
      "name": "Quarto",
      "emoji": "🛏️",
      "description": "Ergonomia, isolamento acústico e controle térmico.",
      "planejar": [
        {
          "id": "qua-pl-1",
          "title": "Medidas Ergonomicas de Guarda-Roupa",
          "desc": "Garanta espaço mínimo de circulação de 60cm livre entre a cama e o guarda-roupa/parede."
        },
        {
          "id": "qua-pl-2",
          "title": "Tomadas de Cabeceira de Cama",
          "desc": "Locar tomadas duplas em ambos os lados da futura cama de casal (altura recomendada de 75cm do contrapiso)."
        },
        {
          "id": "qua-pl-3",
          "title": "Interruptores Paralelos (Three-Way)",
          "desc": "Instale interruptores de cabeceira que permitam apagar a luz geral do quarto sem precisar levantar-se da cama."
        }
      ],
      "prevenir": [
        {
          "id": "qua-pr-1",
          "title": "Tratamento Anti-Mofo em Paredes Divisórias",
          "desc": "Se a parede do quarto faz divisa com banheiro ou área externa, aplique impermeabilizante fundo preparador antes da massa corrida."
        },
        {
          "id": "qua-pr-2",
          "title": "Nivelamento de Batentes e Portas",
          "desc": "Vistorie o prumo dos batentes de porta para evitar que as portas de madeira fiquem batendo ou abrindo sozinhas."
        }
      ],
      "proteger": [
        {
          "id": "qua-pt-1",
          "title": "Calafetação de Rodapés",
          "desc": "Calafete as frestas superiores de rodapés com selante acrílico pintável para evitar acúmulo de poeira e entrada de insetos."
        },
        {
          "id": "qua-pt-2",
          "title": "Feltros Adesivos nos Móveis",
          "desc": "Aplique feltros protetores sob os pés de guarda-roupas, camas e criados-mudos para não riscar o piso vinílico/laminado."
        }
      ]
    },
    "area_externa": {
      "name": "Área Externa",
      "emoji": "🪴",
      "description": "Resistência a intempéries, escoamento de chuva e revestimento antiderrapante.",
      "planejar": [
        {
          "id": "ext-pl-1",
          "title": "Piso Antiderrapante Técnico",
          "desc": "Especifique pisos do tipo rústico ou com coeficiente de atrito dinâmico (COF) maior que 0.4 para evitar escorregões com chuva."
        },
        {
          "id": "ext-pl-2",
          "title": "Grelhas Pluviais de Escoamento",
          "desc": "Dimensione grelhas lineares metálicas para captar água de chuva de grandes áreas pavimentadas externas."
        },
        {
          "id": "ext-pl-3",
          "title": "Pontos de Torneira e Lavagem",
          "desc": "Instale torneiras de jardim de metal robusto em pontos estratégicos para lavagem da área."
        }
      ],
      "prevenir": [
        {
          "id": "ext-pr-1",
          "title": "Impermeabilização com Manta Asfáltica na Laje",
          "desc": "Se a área externa for sobre laje (ex: varanda ou cobertura), aplique primer e manta asfáltica 4mm com teste de água de 72h."
        },
        {
          "id": "ext-pr-2",
          "title": "Declividade Acentuada para Ralos (2%)",
          "desc": "Garanta caimento mais acentuado (mínimo de 1.5% a 2%) em direção às calhas e ralos pluviais."
        }
      ],
      "proteger": [
        {
          "id": "ext-pt-1",
          "title": "Fuga e Junta de Dilatação",
          "desc": "Instale juntas de dilatação de borracha ou PU a cada 3 metros em contrapisos externos para evitar trincas com a variação térmica do sol."
        },
        {
          "id": "ext-pt-2",
          "title": "Resina Protetora de Pedras Naturais",
          "desc": "Aplique hidrofugante ou oleofugante de alta performance em pedras decorativas para evitar manchas e infiltração de água."
        }
      ]
    }
  },
  "decisionTree": {
    "scenarios": [
      {
        "id": "pedreiro-contrato",
        "title": "Pedreiro: Diária ou Empreitada?",
        "emoji": "👷",
        "subtitle": "Saiba qual modelo de contratação protege seu orçamento de atrasos.",
        "questions": [
          {
            "id": "q1",
            "text": "O escopo de trabalho (o que deve ser feito) está 100% definido em um projeto ou lista exata?",
            "options": [
              {
                "text": "Sim, sabemos exatamente cada parede que vai quebrar e revestimento a assentar.",
                "next": "q2"
              },
              {
                "text": "Não, vamos decidir os detalhes à medida que a reforma for andando.",
                "next": "diaria-verdict"
              }
            ]
          },
          {
            "id": "q2",
            "text": "Qual é a sua disponibilidade de estar presente no canteiro de obras para fiscalizar diariamente?",
            "options": [
              {
                "text": "Posso ir no máximo 1 ou 2 vezes por semana fiscalizar.",
                "next": "empreitada-verdict"
              },
              {
                "text": "Tenho tempo de estar na obra todos os dias acompanhando de perto.",
                "next": "q3"
              }
            ]
          },
          {
            "id": "q3",
            "text": "Você possui experiência técnica mínima para coordenar a sequência de tarefas de um pedreiro?",
            "options": [
              {
                "text": "Não, sou leigo e não sei a ordem correta das etapas da reforma.",
                "next": "empreitada-verdict"
              },
              {
                "text": "Sim, já fiz obras e sei coordenar cronogramas e compras.",
                "next": "diaria-verdict"
              }
            ]
          }
        ],
        "verdicts": {
          "diaria-verdict": {
            "title": "Recomendado: CONTRATAÇÃO POR DIÁRIA!",
            "verdictClass": "orange",
            "desc": "Como o escopo é mutável ou você possui tempo e experiência para gerenciar, a diária é viável. Ela permite fazer pequenos ajustes sem multas contratuais. No entanto, exige rédea curta para que o profissional não prolongue o trabalho desnecessariamente.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Estipule metas físicas diárias ('Hoje deve terminar o contrapiso do banheiro') e NUNCA pague diárias adiantadas. Registre em um caderno de bordo."
          },
          "empreitada-verdict": {
            "title": "Recomendado: CONTRATAÇÃO POR EMPREITADA!",
            "verdictClass": "green",
            "desc": "Como você quer previsibilidade financeira, o escopo está desenhado e você não estará presente todo dia, a empreitada (valor fechado pelo serviço todo) protege seu bolso contra a enrolação e a ineficiência.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Faça contrato formal discriminando prazos e divida o pagamento em parcelas atreladas exclusivamente a marcos físicos da obra (ex: 20% no reboco, 30% no revestimento, etc.)."
          }
        }
      },
      {
        "id": "porcelanato-tipo",
        "title": "Porcelanato Retificado ou Comum?",
        "emoji": "🧱",
        "subtitle": "Aprenda a escolher o acabamento certo sem pagar mais caro por erros de mão de obra.",
        "questions": [
          {
            "id": "qp1",
            "text": "Qual o tamanho médio do ambiente onde o piso será assentado?",
            "options": [
              {
                "text": "Ambiente Pequeno (Lavabo, Banheiro padrão, Cozinha pequena)",
                "next": "qp2"
              },
              {
                "text": "Ambiente Amplo (Integração de Sala e Cozinha, Varanda gourmet)",
                "next": "qp3"
              }
            ]
          },
          {
            "id": "qp2",
            "text": "Você tem preferência visual por juntas quase imperceptíveis (piso parecendo peça única)?",
            "options": [
              {
                "text": "Sim, detesto rejunte largo de cimento aparecendo.",
                "next": "retificado-verdict"
              },
              {
                "text": "Tanto faz, o custo-benefício financeiro é o mais importante para mim.",
                "next": "comum-verdict"
              }
            ]
          },
          {
            "id": "qp3",
            "text": "O nível técnico do seu pedreiro é comprovadamente alto para assentamento de grandes formatos?",
            "options": [
              {
                "text": "Sim, ele possui ventosas de sucção, niveladores e serra mármore a úmido.",
                "next": "retificado-verdict"
              },
              {
                "text": "Não tenho certeza, ele parece ter ferramentas simples de mão.",
                "next": "comum-verdict"
              }
            ]
          }
        ],
        "verdicts": {
          "retificado-verdict": {
            "title": "Recomendado: PORCELANATO RETIFICADO!",
            "verdictClass": "green",
            "desc": "O porcelanato retificado possui bordas retas cortadas a laser, permitindo juntas de assentamento mínimas de 1mm a 1.5mm. Isso gera um acabamento de alto padrão, moderno e muito mais fácil de limpar devido à menor área de rejunte.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Exija o uso de espaçadores niveladores de piso e rejunte acrílico ou epóxi. Certifique-se de comprar 10% a 15% de margem de sobra para perdas de recortes."
          },
          "comum-verdict": {
            "title": "Recomendado: PORCELANATO BORDINHA ARREDONDADA (BOLD)!",
            "verdictClass": "orange",
            "desc": "O piso comum (borda bold arredondada) exige juntas maiores de 3mm a 5mm. Ele é mais barato de comprar e de assentar, tolerando pequenas imperfeições no contrapiso e no prumo da mão de obra sem 'dentes' salientes.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Compre rejunte de boa qualidade combinando com a cor do piso para disfarçar a largura das juntas. Proteja contra sujeira durante a obra."
          }
        }
      },
      {
        "id": "moveis-marcenaria",
        "title": "Móveis: Marcenaria ou Modulados?",
        "emoji": "🛋️",
        "subtitle": "A diferença real de custo, durabilidade e flexibilidade no layout.",
        "questions": [
          {
            "id": "qm1",
            "text": "Quanto tempo você pretende morar neste imóvel atual?",
            "options": [
              {
                "text": "Provisório (Alugado ou pretendo vender em menos de 4 anos)",
                "next": "modulado-verdict"
              },
              {
                "text": "Definitivo (Imóvel próprio e foco de longo prazo)",
                "next": "qm2"
              }
            ]
          },
          {
            "id": "qm2",
            "text": "O ambiente possui paredes tortas, vigas aparentes ou recortes muito específicos?",
            "options": [
              {
                "text": "Sim, o cômodo é cheio de ângulos difíceis e vigas baixas.",
                "next": "marcenaria-verdict"
              },
              {
                "text": "Não, as paredes são retas com layout bem quadrado.",
                "next": "qm3"
              }
            ]
          },
          {
            "id": "qm3",
            "text": "Qual é o seu teto financeiro para o mobiliário deste cômodo?",
            "options": [
              {
                "text": "Orçamento apertado (Tenho limite estrito para gastar)",
                "next": "modulado-verdict"
              },
              {
                "text": "Consigo investir mais se o acabamento e aproveitamento forem superiores",
                "next": "marcenaria-verdict"
              }
            ]
          }
        ],
        "verdicts": {
          "marcenaria-verdict": {
            "title": "Recomendado: MARCENARIA SOB MEDIDA!",
            "verdictClass": "green",
            "desc": "A marcenaria sob medida aproveita 100% dos espaços, veda frestas com fechamento perfeito até o teto e contorna vigas/colunas perfeitamente. Possui durabilidade superior e alta valorização do imóvel.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Exija MDF de qualidade (evite MDP em áreas úmidas como cozinha e banheiros). Defina ferragens com amortecedores nas portas e gavetas."
          },
          "modulado-verdict": {
            "title": "Recomendado: MÓVEIS MODULADOS / PRONTOS!",
            "verdictClass": "orange",
            "desc": "Os móveis modulados em lojas de departamento ou e-commerce custam de 40% a 60% menos do que a marcenaria planejada. A montagem é rápida, mas requer montador qualificado e adaptações de cantoneiras para cobrir frestas vazias.",
            "action": "⚠️ AÇÃO OBRIGATÓRIA: Meça as paredes com margem de folga de 2cm a 3cm de cada lado para garantir que os módulos caibam fisicamente sem travar portas."
          }
        }
      }
    ]
  },
  "waterproofingGuide": {
    "areas": {
      "area-banheiro": {
        "title": "🚿 Impermeabilização de Box & Banheiro",
        "intro": "O banheiro é a área mais crítica de uma casa. Vazamento de box destrói o gesso e a pintura do vizinho de baixo, gerando processos e multas caras de reparação.",
        "steps": [
          {
            "num": "1",
            "title": "Regularização de Superfície",
            "desc": "Limpe toda a poeira e remova restos de massa. O contrapiso do box deve ter caimento de 1% a 2% em direção ao ralo grelha."
          },
          {
            "num": "2",
            "title": "Tratamento de Cantos (Meia-Cana)",
            "desc": "Arredonde os cantos de encontro entre parede e chão com argamassa e aditivo colante. Cantos vivos de 90° trincam a impermeabilização."
          },
          {
            "num": "3",
            "title": "Aplicação do Produto (Argamassa Polimérica)",
            "desc": "Aplique a argamassa polimérica (ex: Viaplus 1000 ou Sikatop 107) com trincha em demãos cruzadas. No chão todo, subindo 1,50 metros nas paredes internas do box."
          },
          {
            "num": "4",
            "title": "Reforço com Tela de Poliéster",
            "desc": "Incorpore uma tela de poliéster estruturante (tela de reforço) na primeira demão fresca nos ralos e cantos de parede. Isso previne rasgos."
          },
          {
            "num": "5",
            "title": "Teste de Estanqueidade de 72 Horas",
            "desc": "Obrigatório! Feche a saída do ralo, encha a bacia do box com 5cm de água, marque o nível e espere 3 dias para vistoriar o andar inferior antes de assentar porcelanato."
          }
        ]
      },
      "area-cozinha": {
        "title": "🍳 Impermeabilização da Cozinha & Lavanderia",
        "intro": "A umidade da pia e da máquina de lavar penetra na alvenaria, gerando mofo verde que apodrece os armários planejados de MDF por trás.",
        "steps": [
          {
            "num": "1",
            "title": "Impermeabilização de Base de Paredes",
            "desc": "Aplique impermeabilizante cimentício flexível na base de todas as paredes da cozinha até a altura de 30cm do piso. Isso impede a umidade ascendente."
          },
          {
            "num": "2",
            "title": "Calafetação de Bancadas de Granito",
            "desc": "O frontão da bancada (aquela pedra de 10cm colada na parede) deve ser vedado com selante PU40. Rejunte comum trinca e deixa a água da pia escorrer por trás dos armários."
          },
          {
            "num": "3",
            "title": "Área da Máquina de Lavar",
            "desc": "Aplique impermeabilização polimérica no piso sob o tanque e a máquina de lavar, subindo 50cm nas paredes próximas aos pontos de escoamento e torneiras."
          }
        ]
      },
      "area-paredes": {
        "title": "🧱 Blindagem de Paredes contra Umidade da Terra",
        "intro": "Paredes externas encostadas em barrancos ou que recebem batida de chuva direta tendem a descascar a pintura no rodapé.",
        "steps": [
          {
            "num": "1",
            "title": "Remoção do Reboco Podre",
            "desc": "Se a parede já está descascando, remova todo o reboco afetado até chegar nos tijolos, subindo 50cm acima da área manchada."
          },
          {
            "num": "2",
            "title": "Argamassa com Aditivo Hidrófugo",
            "desc": "Refaça o reboco misturando aditivo impermeabilizante líquido (ex: Vedacit ou Sika 1) na água do amassamento do cimento e areia."
          },
          {
            "num": "3",
            "title": "Bloqueador de Umidade de Rodapé",
            "desc": "Aplique impermeabilizante cimentício de cura rápida diretamente sobre os blocos antes de rebocar, formando uma barreira física contra a capilaridade da terra."
          }
        ]
      }
    }
  },
  "recommendedProducts": {
    "porcelanato-retificado": [
      {
        "name": "Porcelanato Portobello 80x80 Retificado Bianco",
        "price": "R$ 89,90/m²",
        "spec": "Bordas retas de 1.5mm, acabamento polido alto padrão",
        "link": "https://www.leroymerlin.com.br/busca?q=porcelanato+retificado"
      },
      {
        "name": "Porcelanato Eliane 60x60 Retificado Munari",
        "price": "R$ 64,90/m²",
        "spec": "Juntas de 1mm, acabamento acetinado fácil de limpar",
        "link": "https://www.leroymerlin.com.br/busca?q=porcelanato+retificado+eliane"
      }
    ],
    "porcelanato-bold": [
      {
        "name": "Porcelanato Artens 60x60 Arredondado (Bold)",
        "price": "R$ 49,90/m²",
        "spec": "Bordas arredondadas bold, juntas de 3mm, ótimo custo-benefício",
        "link": "https://www.leroymerlin.com.br/busca?q=porcelanato+bold"
      }
    ],
    "impermeabilizacao-banheiro": [
      {
        "name": "SikaTop 100 Caixa 18kg (Impermeabilizante)",
        "price": "R$ 139,90",
        "spec": "Argamassa cimentícia bicomponente ideal para banheiros e cozinhas",
        "link": "https://www.leroymerlin.com.br/busca?q=sikatop+100"
      },
      {
        "name": "Viaplus 1000 Viapol 18kg",
        "price": "R$ 124,90",
        "spec": "Bicomponente semiflexível, excelente barreira contra umidade ascendente",
        "link": "https://www.leroymerlin.com.br/busca?q=viaplus+1000"
      }
    ],
    "impermeabilizacao-laje-externa": [
      {
        "name": "Viaplus 7000 Viapol Fibras 18kg",
        "price": "R$ 189,90",
        "spec": "Fibras sintéticas integradas, ideal para locais expostos ao sol",
        "link": "https://www.leroymerlin.com.br/busca?q=viaplus+7000"
      },
      {
        "name": "SikaTop 209 Flex Bicomponente 18kg",
        "price": "R$ 219,90",
        "spec": "Argamassa ultra flexível, resiste a dilatações e fissuras em lajes",
        "link": "https://www.leroymerlin.com.br/busca?q=sikatop+209"
      }
    ],
    "impermeabilizacao-paredes": [
      {
        "name": "Quartzolit Tecplus Top 18kg",
        "price": "R$ 119,90",
        "spec": "Aditivo e revestimento cimentício que blinda paredes contra rodapé úmido",
        "link": "https://www.leroymerlin.com.br/busca?q=tecplus+top+quartzolit"
      }
    ],
    "marcenaria-sob-medida": [
      {
        "name": "Chapa MDF Duratex Branco TX 15mm 2.75x1.84m",
        "price": "R$ 289,90",
        "spec": "Chapa de MDF padrão de alta densidade para gavetas e portas",
        "link": "https://www.leroymerlin.com.br/busca?q=chapa+mdf+15mm"
      },
      {
        "name": "Chapa MDF Ultra Premium Resistente à Umidade 15mm",
        "price": "R$ 399,90",
        "spec": "Proteção verde anti-umidade e cupim para cozinha e lavatórios",
        "link": "https://www.leroymerlin.com.br/busca?q=mdf+ultra+resistente+umidade"
      }
    ],
    "moveis-modulados": [
      {
        "name": "Cozinha Modulada Completa Madesa Glamy 290cm",
        "price": "R$ 1.899,00",
        "spec": "Kit modulado completo de alta resistência e custo reduzido",
        "link": "https://www.amazon.com.br/s?k=cozinha+modulada+madesa"
      }
    ]
  },
  "library": [
    {
      "id": "pdf-1-cozinha",
      "title": "PDF 1 — Meu Sonho no Papel",
      "category": "planejamento",
      "pages": 12,
      "desc": "Defina as diretrizes básicas, necessidades e desejos para iniciar sua reforma com o pé direito.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "sonho"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF-1-MEU-SONHO-NO-PAPEL-C...",
      "env": "cozinha"
    },
    {
      "id": "pdf-1-banheiro",
      "title": "PDF 1 — Meu Sonho no Papel",
      "category": "planejamento",
      "pages": 12,
      "desc": "Defina as diretrizes básicas, necessidades e desejos para iniciar sua reforma com o pé direito.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "sonho"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-1-MEUS-SONHO-NO-PAPEL...",
      "env": "banheiro"
    },
    {
      "id": "pdf-1-sala",
      "title": "PDF 1 — Meu Sonho no Papel",
      "category": "planejamento",
      "pages": 12,
      "desc": "Defina as diretrizes básicas, necessidades e desejos para iniciar sua reforma com o pé direito.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "sonho"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-1-MEU-SONHO-NO-PAPEL-SALA...",
      "env": "sala"
    },
    {
      "id": "pdf-1-quarto",
      "title": "PDF 1 — Meu Sonho no Papel",
      "category": "planejamento",
      "pages": 12,
      "desc": "Defina as diretrizes básicas, necessidades e desejos para iniciar sua reforma com o pé direito.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "sonho"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-1-MEU-SONHO-NO-PAPEL-QU...",
      "env": "quarto"
    },
    {
      "id": "pdf-1-area_externa",
      "title": "PDF 1 — Meu Sonho no Papel",
      "category": "planejamento",
      "pages": 12,
      "desc": "Defina as diretrizes básicas, necessidades e desejos para iniciar sua reforma com o pé direito.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "sonho"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-1-MEU-SONHO-NO-PA...",
      "env": "area_externa"
    },
    {
      "id": "pdf-2-cozinha",
      "title": "PDF 2 — Checklist Zero Erro",
      "category": "planejamento",
      "pages": 18,
      "desc": "O roteiro completo para evitar as maiores armadilhas no planejamento inicial da sua obra.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "erro"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF-2-CHECK-LIST-ZERO-ERRO...",
      "env": "cozinha"
    },
    {
      "id": "pdf-2-banheiro",
      "title": "PDF 2 — Checklist Zero Erro",
      "category": "planejamento",
      "pages": 18,
      "desc": "O roteiro completo para evitar as maiores armadilhas no planejamento inicial da sua obra.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "erro"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-2-CHECK-LIST-ZERO-ERR...",
      "env": "banheiro"
    },
    {
      "id": "pdf-2-sala",
      "title": "PDF 2 — Checklist Zero Erro",
      "category": "planejamento",
      "pages": 18,
      "desc": "O roteiro completo para evitar as maiores armadilhas no planejamento inicial da sua obra.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "erro"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-2-CHECKLIST-ZERO-ERRO-SAL...",
      "env": "sala"
    },
    {
      "id": "pdf-2-quarto",
      "title": "PDF 2 — Checklist Zero Erro",
      "category": "planejamento",
      "pages": 18,
      "desc": "O roteiro completo para evitar as maiores armadilhas no planejamento inicial da sua obra.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "erro"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-2-CHECKLIST-ZERO-ERRO-3...",
      "env": "quarto"
    },
    {
      "id": "pdf-2-area_externa",
      "title": "PDF 2 — Checklist Zero Erro",
      "category": "planejamento",
      "pages": 18,
      "desc": "O roteiro completo para evitar as maiores armadilhas no planejamento inicial da sua obra.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "erro"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-2-CHECKLIST-ZRO-E...",
      "env": "area_externa"
    },
    {
      "id": "pdf-3-cozinha",
      "title": "PDF 3 — Layout Inteligente",
      "category": "planejamento",
      "pages": 15,
      "desc": "Aprenda a otimizar a distribuição do espaço e circulação para cada ambiente.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "layout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF-3-GUIA-VISUAL-DE-LAYOU...",
      "env": "cozinha"
    },
    {
      "id": "pdf-3-banheiro",
      "title": "PDF 3 — Layout Inteligente",
      "category": "planejamento",
      "pages": 15,
      "desc": "Aprenda a otimizar a distribuição do espaço e circulação para cada ambiente.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "layout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-3-GUIA-VISUAL-DE-LAYO...",
      "env": "banheiro"
    },
    {
      "id": "pdf-3-sala",
      "title": "PDF 3 — Layout Inteligente",
      "category": "planejamento",
      "pages": 15,
      "desc": "Aprenda a otimizar a distribuição do espaço e circulação para cada ambiente.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "layout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-3-GUIA-VISUAL-DE-LAYOUT-I...",
      "env": "sala"
    },
    {
      "id": "pdf-3-quarto",
      "title": "PDF 3 — Layout Inteligente",
      "category": "planejamento",
      "pages": 15,
      "desc": "Aprenda a otimizar a distribuição do espaço e circulação para cada ambiente.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "layout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-3-GUIA-VISUAL-DE-LAYOUT...",
      "env": "quarto"
    },
    {
      "id": "pdf-3-area_externa",
      "title": "PDF 3 — Layout Inteligente",
      "category": "planejamento",
      "pages": 15,
      "desc": "Aprenda a otimizar a distribuição do espaço e circulação para cada ambiente.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "layout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-3-GUIA-VISUAL-DE-...",
      "env": "area_externa"
    },
    {
      "id": "pdf-4-cozinha",
      "title": "PDF 4 — Caderno de planejamento",
      "category": "planejamento",
      "pages": 14,
      "desc": "Pontos de luz, circuitos e dimensionamento adequado para valorizar a decoração.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "iluminacao"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF -4 - CADERNO-DE-PLANEJ...",
      "env": "cozinha"
    },
    {
      "id": "pdf-4-banheiro",
      "title": "PDF 4 — Caderno de planejamento",
      "category": "planejamento",
      "pages": 14,
      "desc": "Pontos de luz, circuitos e dimensionamento adequado para valorizar a decoração.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "iluminacao"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-4-CADERNO-DE-PLANEJAM...",
      "env": "banheiro"
    },
    {
      "id": "pdf-4-sala",
      "title": "PDF 4 — Caderno de planejamento",
      "category": "planejamento",
      "pages": 14,
      "desc": "Pontos de luz, circuitos e dimensionamento adequado para valorizar a decoração.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "iluminacao"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-4-CADERNO-DE-PLANEJAMENTO...",
      "env": "sala"
    },
    {
      "id": "pdf-4-quarto",
      "title": "PDF 4 — Caderno de planejamento",
      "category": "planejamento",
      "pages": 14,
      "desc": "Pontos de luz, circuitos e dimensionamento adequado para valorizar a decoração.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "iluminacao"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-4-CADERNO-DE-PLANEJAMEN...",
      "env": "quarto"
    },
    {
      "id": "pdf-4-area_externa",
      "title": "PDF 4 — Caderno de planejamento",
      "category": "planejamento",
      "pages": 14,
      "desc": "Pontos de luz, circuitos e dimensionamento adequado para valorizar a decoração.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "iluminacao"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-4-CADERNO-DE-PLAN...",
      "env": "area_externa"
    },
    {
      "id": "pdf-5-cozinha",
      "title": "PDF 5 — Cronograma de Compras",
      "category": "planejamento",
      "pages": 10,
      "desc": "Organize a ordem certa de aquisição dos materiais para evitar gargalos e atrasos.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "cronograma"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF-5-CRONOGRAMA-OFICIAL-C...",
      "env": "cozinha"
    },
    {
      "id": "pdf-5-banheiro",
      "title": "PDF 5 — Cronograma de Compras",
      "category": "planejamento",
      "pages": 10,
      "desc": "Organize a ordem certa de aquisição dos materiais para evitar gargalos e atrasos.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "cronograma"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-5-CRONOGRAMA-OFICIAL-...",
      "env": "banheiro"
    },
    {
      "id": "pdf-5-sala",
      "title": "PDF 5 — Cronograma de Compras",
      "category": "planejamento",
      "pages": 10,
      "desc": "Organize a ordem certa de aquisição dos materiais para evitar gargalos e atrasos.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "cronograma"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-5-CRONOGRAMA-OFICIAL-SALA...",
      "env": "sala"
    },
    {
      "id": "pdf-5-quarto",
      "title": "PDF 5 — Cronograma de Compras",
      "category": "planejamento",
      "pages": 10,
      "desc": "Organize a ordem certa de aquisição dos materiais para evitar gargalos e atrasos.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "cronograma"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-5-CRONOGRAMA-OFICIAL-DO...",
      "env": "quarto"
    },
    {
      "id": "pdf-5-area_externa",
      "title": "PDF 5 — Cronograma de Compras",
      "category": "planejamento",
      "pages": 10,
      "desc": "Organize a ordem certa de aquisição dos materiais para evitar gargalos e atrasos.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "cronograma"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-5-CRONOGRAMA-OFIC...",
      "env": "area_externa"
    },
    {
      "id": "pdf-6-cozinha",
      "title": "PDF 6 — Guia de Materiais",
      "category": "planejamento",
      "pages": 16,
      "desc": "Como selecionar pisos, azulejos e texturas adequados para cada área de uso.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "revestimento"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/COZINHA/PDF-6-GUIA-DE-MATERIAIS-CO...",
      "env": "cozinha"
    },
    {
      "id": "pdf-6-banheiro",
      "title": "PDF 6 — Guia de Materiais",
      "category": "planejamento",
      "pages": 16,
      "desc": "Como selecionar pisos, azulejos e texturas adequados para cada área de uso.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "revestimento"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/BANHEIRO/PDF-6-GUIA-DE-MATERIAIS-B...",
      "env": "banheiro"
    },
    {
      "id": "pdf-6-sala",
      "title": "PDF 6 — Guia de Materiais",
      "category": "planejamento",
      "pages": 16,
      "desc": "Como selecionar pisos, azulejos e texturas adequados para cada área de uso.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "revestimento"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/SALA/PDF-6-GUIA-DE-MATERIAIS-SALA.pdf",
      "env": "sala"
    },
    {
      "id": "pdf-6-quarto",
      "title": "PDF 6 — Guia de Materiais",
      "category": "planejamento",
      "pages": 16,
      "desc": "Como selecionar pisos, azulejos e texturas adequados para cada área de uso.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "revestimento"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/QUARTO/PDF-6-GUIA-DE-MATERIAIS-QUA...",
      "env": "quarto"
    },
    {
      "id": "pdf-6-area_externa",
      "title": "PDF 6 — Guia de Materiais",
      "category": "planejamento",
      "pages": 16,
      "desc": "Como selecionar pisos, azulejos e texturas adequados para cada área de uso.",
      "tags": [
        "cozinha",
        "banheiro",
        "quarto",
        "sala",
        "area_externa",
        "planejamento",
        "revestimento"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 1 - PLANEJAR/AREA EXTERNA/PDF-6-GUIA-DE-MATERIA...",
      "env": "area_externa"
    },
    {
      "id": "pdf-7-cozinha",
      "title": "PDF 7 — Roteiro do Orçamento Blindado Cozinha",
      "category": "financeiro",
      "pages": 20,
      "desc": "O passo a passo para calcular custos e evitar surpresas financeiras na reforma da sua Cozinha.",
      "tags": [
        "cozinha",
        "financeiro",
        "orcamento",
        "blindado"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/COZINHA/PDF-7-ROTEIRO-DO-ORCAMENTO...",
      "env": "cozinha"
    },
    {
      "id": "pdf-8-cozinha",
      "title": "PDF 8 — Guia de Contratação Estratégica Cozinha",
      "category": "materiais",
      "pages": 15,
      "desc": "Minuta e cláusulas de segurança para contratar a mão de obra específica de sua Cozinha.",
      "tags": [
        "cozinha",
        "materiais",
        "contratacao",
        "guia"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/COZINHA/PDF-8-GUIA-DE-CONTRATACAO-...",
      "env": "cozinha"
    },
    {
      "id": "pdf-9-cozinha",
      "title": "PDF 9 — Lista de Compras Completa Cozinha",
      "category": "materiais",
      "pages": 25,
      "desc": "Checklist exato dos materiais básicos e de acabamento que você precisa orçar e comprar para sua Cozinha.",
      "tags": [
        "cozinha",
        "materiais",
        "compras",
        "lista"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/COZINHA/PDF-9-LISTA-DE-COMPRAS-COM...",
      "env": "cozinha"
    },
    {
      "id": "pdf-10-cozinha",
      "title": "PDF 10 — Checklist de Entrega e Vistoria Cozinha",
      "category": "tecnico",
      "pages": 12,
      "desc": "Como conferir e inspecionar cada detalhe técnico da sua Cozinha antes de liberar o pagamento final.",
      "tags": [
        "cozinha",
        "tecnico",
        "checklist",
        "vistoria"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/COZINHA/PDF-10-CHECK-LIST-FINAL-DE...",
      "env": "cozinha"
    },
    {
      "id": "pdf-11-cozinha",
      "title": "PDF 11 — Check-out & Termos de Garantia Cozinha",
      "category": "contratos",
      "pages": 8,
      "desc": "Manual para coletar termos de garantia, notas fiscais e manuais dos fornecedores da Cozinha.",
      "tags": [
        "cozinha",
        "contratos",
        "garantia",
        "checkout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/COZINHA/PDF-11-CHECK-OUT-and-GARAN...",
      "env": "cozinha"
    },
    {
      "id": "pdf-12-cozinha",
      "title": "PDF 12 — Relatório final da obra",
      "category": "tecnico",
      "pages": 14,
      "desc": "Guia de conservação e limpeza para aumentar a durabilidade de móveis e acabamentos da Cozinha.",
      "tags": [
        "cozinha",
        "tecnico",
        "manutencao",
        "manual"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/COZINHA/PDF-12-RELATORIO-FINAL-DA-...",
      "env": "cozinha"
    },
    {
      "id": "pdf-7-banheiro",
      "title": "PDF 7 — Roteiro do Orçamento Blindado Banheiro",
      "category": "financeiro",
      "pages": 20,
      "desc": "O passo a passo para calcular custos e evitar surpresas financeiras na reforma do seu Banheiro.",
      "tags": [
        "banheiro",
        "financeiro",
        "orcamento",
        "blindado"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/BANHEIRO/GUIA-7-ROTEIRO DO ORCAMEN...",
      "env": "banheiro"
    },
    {
      "id": "pdf-8-banheiro",
      "title": "PDF 8 — Guia de Contratação Estratégica Banheiro",
      "category": "materiais",
      "pages": 15,
      "desc": "Minuta e cláusulas de segurança para contratar a mão de obra específica de seu Banheiro.",
      "tags": [
        "banheiro",
        "materiais",
        "contratacao",
        "guia"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/BANHEIRO/PDF-8-GUIA-DE-CONTRATACAO...",
      "env": "banheiro"
    },
    {
      "id": "pdf-9-banheiro",
      "title": "PDF 9 — Lista de Compras Completa Banheiro",
      "category": "materiais",
      "pages": 25,
      "desc": "Checklist exato dos materiais básicos e de acabamento que você precisa orçar e comprar para seu Banheiro.",
      "tags": [
        "banheiro",
        "materiais",
        "compras",
        "lista"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/BANHEIRO/PDF-9-GUIA-DE-COMPRAS-SEM...",
      "env": "banheiro"
    },
    {
      "id": "pdf-10-banheiro",
      "title": "PDF 10 — Checklist de Entrega e Vistoria Banheiro",
      "category": "tecnico",
      "pages": 12,
      "desc": "Como conferir e inspecionar cada detalhe técnico do seu Banheiro antes de liberar o pagamento final.",
      "tags": [
        "banheiro",
        "tecnico",
        "checklist",
        "vistoria"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/BANHEIRO/PDF-10-CHECK-LIST-FINAL-D...",
      "env": "banheiro"
    },
    {
      "id": "pdf-11-banheiro",
      "title": "PDF 11 — Check-out & Termos de Garantia Banheiro",
      "category": "contratos",
      "pages": 8,
      "desc": "Manual para coletar termos de garantia, notas fiscais e manuais dos fornecedores do Banheiro.",
      "tags": [
        "banheiro",
        "contratos",
        "garantia",
        "checkout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/BANHEIRO/PDF-11-CHECK-OUT-and-GARA...",
      "env": "banheiro"
    },
    {
      "id": "pdf-12-banheiro",
      "title": "PDF 12 — Relatório final da obra",
      "category": "tecnico",
      "pages": 14,
      "desc": "Guia de conservação e limpeza para aumentar a durabilidade de móveis e acabamentos do Banheiro.",
      "tags": [
        "banheiro",
        "tecnico",
        "manutencao",
        "manual"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/BANHEIRO/PDF-12-RELATORIO-FINAL-DA...",
      "env": "banheiro"
    },
    {
      "id": "pdf-7-quarto",
      "title": "PDF 7 — Roteiro do Orçamento Blindado Quarto",
      "category": "financeiro",
      "pages": 20,
      "desc": "O passo a passo para calcular custos e evitar surpresas financeiras na reforma do seu Quarto.",
      "tags": [
        "quarto",
        "financeiro",
        "orcamento",
        "blindado"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/QUARTO/PDF-7-ROTEIRO-DO-ORCAMENTO-...",
      "env": "quarto"
    },
    {
      "id": "pdf-8-quarto",
      "title": "PDF 8 — Guia de Contratação Estratégica Quarto",
      "category": "materiais",
      "pages": 15,
      "desc": "Minuta e cláusulas de segurança para contratar a mão de obra específica de seu Quarto.",
      "tags": [
        "quarto",
        "materiais",
        "contratacao",
        "guia"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/QUARTO/PDF-8-GUIA-DE-CONTRATACAO-E...",
      "env": "quarto"
    },
    {
      "id": "pdf-9-quarto",
      "title": "PDF 9 — Lista de Compras Completa Quarto",
      "category": "materiais",
      "pages": 25,
      "desc": "Checklist exato dos materiais básicos e de acabamento que você precisa orçar e comprar para seu Quarto.",
      "tags": [
        "quarto",
        "materiais",
        "compras",
        "lista"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/QUARTO/PDF-9- GUIA DE COMPRAS SEM ...",
      "env": "quarto"
    },
    {
      "id": "pdf-10-quarto",
      "title": "PDF 10 — Checklist de Entrega e Vistoria Quarto",
      "category": "tecnico",
      "pages": 12,
      "desc": "Como conferir e inspecionar cada detalhe técnico do seu Quarto antes de liberar o pagamento final.",
      "tags": [
        "quarto",
        "tecnico",
        "checklist",
        "vistoria"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/QUARTO/PDF-10-CHECKLIST-FINAL-DE-E...",
      "env": "quarto"
    },
    {
      "id": "pdf-11-quarto",
      "title": "PDF 11 — Check-out & Termos de Garantia Quarto",
      "category": "contratos",
      "pages": 8,
      "desc": "Manual para coletar termos de garantia, notas fiscais e manuais dos fornecedores del Quarto.",
      "tags": [
        "quarto",
        "contratos",
        "garantia",
        "checkout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/QUARTO/PDF-11-CHECK-OUT-and-GARANT...",
      "env": "quarto"
    },
    {
      "id": "pdf-12-quarto",
      "title": "PDF 12 — Relatório final da obra",
      "category": "tecnico",
      "pages": 14,
      "desc": "Guia de conservação e limpeza para aumentar a durabilidade de móveis e acabamentos do Quarto.",
      "tags": [
        "quarto",
        "tecnico",
        "manutencao",
        "manual"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/QUARTO/PDF-12-RELATORIO-FINAL-DA-O...",
      "env": "quarto"
    },
    {
      "id": "pdf-7-sala",
      "title": "PDF 7 — Roteiro do Orçamento Blindado Sala",
      "category": "financeiro",
      "pages": 20,
      "desc": "O passo a passo para calcular custos e evitar surpresas financeiras na reforma da sua Sala.",
      "tags": [
        "sala",
        "financeiro",
        "orcamento",
        "blindado"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/SALA/PDF-7-ROTEIRO-DO-ORCAMENTO-BL...",
      "env": "sala"
    },
    {
      "id": "pdf-8-sala",
      "title": "PDF 8 — Guia de Contratação Estratégica Sala",
      "category": "materiais",
      "pages": 15,
      "desc": "Minuta e cláusulas de segurança para contratar a mão de obra específica de sua Sala.",
      "tags": [
        "sala",
        "materiais",
        "contratacao",
        "guia"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/SALA/PDF-8-GUIA-DE-CONTRATACAO-EST...",
      "env": "sala"
    },
    {
      "id": "pdf-9-sala",
      "title": "PDF 9 — Lista de Compras Completa Sala",
      "category": "materiais",
      "pages": 25,
      "desc": "Checklist exato dos materiais básicos e de acabamento que você precisa orçar e comprar para sua Sala.",
      "tags": [
        "sala",
        "materiais",
        "compras",
        "lista"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/SALA/PDF-9-GUIA-DE-COMPRAS-SALA.pdf",
      "env": "sala"
    },
    {
      "id": "pdf-10-sala",
      "title": "PDF 10 — Checklist de Entrega e Vistoria Sala",
      "category": "tecnico",
      "pages": 12,
      "desc": "Como conferir e inspecionar cada detalhe técnico da sua Sala antes de liberar o pagamento final.",
      "tags": [
        "sala",
        "tecnico",
        "checklist",
        "vistoria"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/SALA/PDF-10-CHECK-LIST-FINAL-DE-EN...",
      "env": "sala"
    },
    {
      "id": "pdf-11-sala",
      "title": "PDF 11 — Check-out & Termos de Garantia Sala",
      "category": "contratos",
      "pages": 8,
      "desc": "Manual para coletar termos de garantia, notas fiscais e manuais dos fornecedores da Sala.",
      "tags": [
        "sala",
        "contratos",
        "garantia",
        "checkout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/SALA/PDF-11-CHECK-OUT-and-GARANTIA...",
      "env": "sala"
    },
    {
      "id": "pdf-12-sala",
      "title": "PDF 12 — Relatório final da obra",
      "category": "tecnico",
      "pages": 14,
      "desc": "Guia de conservação e limpeza para aumentar a durabilidade de móveis e acabamentos da Sala.",
      "tags": [
        "sala",
        "tecnico",
        "manutencao",
        "manual"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/SALA/PDF-12-RELATORIO-FINAL-DA-OBR...",
      "env": "sala"
    },
    {
      "id": "pdf-7-area_externa",
      "title": "PDF 7 — Roteiro do Orçamento Blindado Área Externa",
      "category": "financeiro",
      "pages": 20,
      "desc": "O passo a passo para calcular custos e evitar surpresas financeiras na reforma da sua Área Externa.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "financeiro",
        "orcamento",
        "blindado"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/AREA EXTERNA/PDF-7-ROTEIRO-DO-ORCA...",
      "env": "area_externa"
    },
    {
      "id": "pdf-8-area_externa",
      "title": "PDF 8 — Guia de Contratação Estratégica Área Externa",
      "category": "materiais",
      "pages": 15,
      "desc": "Minuta e cláusulas de segurança para contratar a mão de obra específica de sua Área Externa.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "materiais",
        "contratacao",
        "guia"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/AREA EXTERNA/PDF-8-GUIA-DE-CONTRAT...",
      "env": "area_externa"
    },
    {
      "id": "pdf-9-area_externa",
      "title": "PDF 9 — Lista de Compras Completa Área Externa",
      "category": "materiais",
      "pages": 25,
      "desc": "Checklist exato dos materiais básicos e de acabamento que você precisa orçar e comprar para sua Área Externa.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "materiais",
        "compras",
        "lista"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 2 - PREVENIR/AREA EXTERNA/PDF-9-GUIA-DE-COMPRAS...",
      "env": "area_externa"
    },
    {
      "id": "pdf-10-area_externa",
      "title": "PDF 10 — Checklist de Entrega e Vistoria Área Externa",
      "category": "tecnico",
      "pages": 12,
      "desc": "Como conferir e inspecionar cada detalhe técnico da sua Área Externa antes de liberar o pagamento final.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "tecnico",
        "checklist",
        "vistoria"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/AREA EXTERNA/PDF-10-CHECK-LIST-FIN...",
      "env": "area_externa"
    },
    {
      "id": "pdf-11-area_externa",
      "title": "PDF 11 — Check-out & Termos de Garantia Área Externa",
      "category": "contratos",
      "pages": 8,
      "desc": "Manual para coletar termos de garantia, notas fiscais e manuais dos fornecedores da Área Externa.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "contratos",
        "garantia",
        "checkout"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/AREA EXTERNA/PDF-11-CHECK-OUT-and-...",
      "env": "area_externa"
    },
    {
      "id": "pdf-12-area_externa",
      "title": "PDF 12 — Relatório final da obra",
      "category": "tecnico",
      "pages": 14,
      "desc": "Guia de conservação e limpeza para aumentar a durabilidade de móveis e acabamentos da Área Externa.",
      "tags": [
        "area_externa",
        "area",
        "externa",
        "tecnico",
        "manutencao",
        "manual"
      ],
      "url": "./MÉTODO 3P/GUIAS E ESTRATÉGIAS/FASE 3 - PROTEGER/AREA EXTERNA/PDF-12-RELATORIO-FINA...",
      "env": "area_externa"
    }
  ]
};

// Support manual custom links added by Administrator
const savedCustomPdfs = localStorage.getItem('reformas_3p_custom_pdfs');
if (savedCustomPdfs) {
  try {
    const list = JSON.parse(savedCustomPdfs);
    list.forEach(pdf => {
      METODO_3P_DATABASE.library.push(pdf);
    });
  } catch (e) {
    console.error("Error loading custom pdfs:", e);
  }
}
