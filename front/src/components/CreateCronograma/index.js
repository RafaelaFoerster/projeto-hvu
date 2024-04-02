import React, { useState } from "react";
import { useRouter } from "next/router";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./index.module.css";
import VoltarButton from "../VoltarButton";
import { CancelarWhiteButton } from "../WhiteButton";
import EspecialidadeList from "@/hooks/useEspecialidadeList";
import MedicoList from "@/hooks/useMedicoList";
import { createCronograma } from "../../../services/cronogramaService";

function CreateCronograma() {
    const router = useRouter();

    const [cronograma, setCronograma] = useState({
        nome: "",
        tempoAtendimento: null,
        horariosJson: {},
        medico: { id: null },
        especialidade: { id: null }
    });

    const [diasDaSemana, setDiasDaSemana] = useState({
        Segunda: false,
        Terça: false,
        Quarta: false,
        Quinta: false,
        Sexta: false
    });

    const handleDiasDaSemanaChange = (dia) => {
        setDiasDaSemana(prevState => ({
            ...prevState,
            [dia]: !prevState[dia]
        }));
    };

    const handleHorarioChange = (dia, campo) => (event) => {
        const { value } = event.target;
        setCronograma(prevCronograma => ({
            ...prevCronograma,
            horariosJson: {
                ...prevCronograma.horariosJson,
                [dia]: {
                    ...prevCronograma.horariosJson[dia],
                    [campo]: value
                }
            }
        }));
    };

    const handleCronogramaChange = (event) => {
        const { name, value } = event.target;
        setCronograma({ ...cronograma, [name]: value });
    };
    console.log("cronograma:", cronograma);

    const { especialidades } = EspecialidadeList();
    const [selectedEspecialidade, setSelectedEspecialidade] = useState(null);
    const handleEspecialidadeSelection = (event) => {
        const selectedEspecialidadeId = event.target.value;
        setSelectedEspecialidade(selectedEspecialidadeId);
    };

    const { medicos } = MedicoList();
    const [selectedMedico, setSelectedMedico] = useState(null);
    const handleMedicoSelection = (event) => {
        const selectedMedicoId = event.target.value;
        setSelectedMedico(selectedMedicoId);
    };

    const handleCreateCronograma = async () => {
        const diasSelecionados = Object.entries(diasDaSemana)
            .filter(([_, selecionado]) => selecionado)
            .map(([dia]) => dia.toUpperCase());
        
        const horariosJson = {};
        diasSelecionados.forEach(dia => {
            if (cronograma.horariosJson[dia]) {
                horariosJson[dia] = cronograma.horariosJson[dia]; 
            } else {
                horariosJson[dia] = {
                    inicio: "00:00",
                    fim: "00:00"
                };
            }
        });

        const cronogramaToCreate = {
            nome: cronograma.nome,
            tempoAtendimento: parseInt(cronograma.tempoAtendimento),
            horariosJson: JSON.stringify(horariosJson),
            medico: { id: parseInt(selectedMedico) },
            especialidade: { id: parseInt(selectedEspecialidade) }
        };
        console.log("cronogramaToCreate", cronogramaToCreate);

        try {
            await createCronograma(cronogramaToCreate);
            alert("Agenda criada com sucesso!");
            // router.push("/");
        } catch (error) {
            console.error("Erro ao criar agenda:", error);
            alert("Erro ao criar agenda. Por favor, tente novamente.");
        }
    };

    return (
        <div className={styles.container}>
            <VoltarButton />
            <h1>Criar agenda</h1>
            <form className={styles.inputs_container}>
                <div className={styles.inputs_box}>
                    <div className="row">
                        <div className={`col ${styles.col}`}>
                            <label htmlFor="nome" className="form-label">Nome</label>
                            <input
                                placeholder="Digite o nome"
                                type="text"
                                className={`form-control ${styles.input}`}
                                name="nome"
                                value={cronograma.nome}
                                onChange={handleCronogramaChange}
                            />
                        </div>

                        <div className={`col ${styles.col}`}>
                            <label htmlFor="especialidade" className="form-label">Especialidade</label>
                            <select
                                className={`form-select ${styles.input}`}
                                name="especialidade"
                                aria-label="Selecione uma especialidade"
                                value={selectedEspecialidade || ""}
                                onChange={handleEspecialidadeSelection}
                            >
                                <option value="">Selecione a especialidade</option>
                                {especialidades.map((especialidade) => (
                                    <option key={especialidade.id} value={especialidade.id}>
                                        {especialidade.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="row">
                        <div className={`col ${styles.col}`}>
                            <label htmlFor="medico" className="form-label">Veterinário(a)</label>
                            <select
                                className={`form-select ${styles.input}`}
                                name="medico"
                                aria-label="Selecione o(a) veterinário(a)"
                                value={selectedMedico || ""}
                                onChange={handleMedicoSelection}
                            >
                                <option value="">Selecione o(a) veterinário(a)</option>
                                {medicos.map((medico) => (
                                    <option key={medico.id} value={medico.id}>
                                        {medico.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`col ${styles.col}`}>
                            <label htmlFor="tempoAtendimento" className="form-label">Tempo do atendimento</label>
                            <input
                                placeholder="Digite o tempo em minutos"
                                type="text"
                                className={`form-control ${styles.input}`}
                                name="tempoAtendimento"
                                value={cronograma.tempoAtendimento}
                                onChange={handleCronogramaChange}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className={styles.title}><h2>Dias de trabalho</h2></div>
                    </div>

                    <div className={`row ${styles.div_space}`}>
                        <div className="col">
                            {Object.entries(diasDaSemana)
                                .filter(([dia]) => ['Segunda'].includes(dia))
                                .map(([dia, selecionado]) => (
                                    <div key={dia}>
                                        <div className={styles.input_space}>
                                            <div htmlFor={`${dia}-checkbox`} className="form-label">
                                                {`${dia.charAt(0).toUpperCase() + dia.slice(1)}`}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${styles.checkbox}`}
                                                id={`${dia}-checkbox`}
                                                checked={selecionado}
                                                onChange={() => handleDiasDaSemanaChange(dia)}
                                            />
                                        </div>
                                        {selecionado && (
                                            <div className={`col ${styles.time_container}`}>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-inicio`} className="form-label"><h6 className={styles.time}>Horário de início</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-inicio`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.inicio || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "inicio")}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-fim`} className="form-label"><h6 className={styles.time}>Horário de fim</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-fim`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.fim || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "fim")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="col">
                            {Object.entries(diasDaSemana)
                                .filter(([dia]) => ['Terça'].includes(dia))
                                .map(([dia, selecionado]) => (
                                    <div key={dia}>
                                        <div className={styles.input_space}>
                                            <div htmlFor={`${dia}-checkbox`} className="form-label">
                                                {`${dia.charAt(0).toUpperCase() + dia.slice(1)}`}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${styles.checkbox}`}
                                                id={`${dia}-checkbox`}
                                                checked={selecionado}
                                                onChange={() => handleDiasDaSemanaChange(dia)}
                                            />
                                        </div>
                                        {selecionado && (
                                            <div className={`col ${styles.time_container}`}>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-inicio`} className="form-label"><h6 className={styles.time}>Horário de início</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-inicio`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.inicio || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "inicio")}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-fim`} className="form-label"><h6 className={styles.time}>Horário de fim</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-fim`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.fim || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "fim")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="col">
                            {Object.entries(diasDaSemana)
                                .filter(([dia]) => ['Quarta'].includes(dia))
                                .map(([dia, selecionado]) => (
                                    <div key={dia}>
                                        <div className={styles.input_space}>
                                            <div htmlFor={`${dia}-checkbox`} className="form-label">
                                                {`${dia.charAt(0).toUpperCase() + dia.slice(1)}`}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${styles.checkbox}`}
                                                id={`${dia}-checkbox`}
                                                checked={selecionado}
                                                onChange={() => handleDiasDaSemanaChange(dia)}
                                            />
                                        </div>
                                        {selecionado && (
                                            <div className={`col ${styles.time_container}`}>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-inicio`} className="form-label"><h6 className={styles.time}>Horário de início</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-inicio`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.inicio || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "inicio")}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-fim`} className="form-label"><h6 className={styles.time}>Horário de fim</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-fim`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.fim || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "fim")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="col">
                            {Object.entries(diasDaSemana)
                                .filter(([dia]) => ['Quinta'].includes(dia))
                                .map(([dia, selecionado]) => (
                                    <div key={dia}>
                                        <div className={styles.input_space}>
                                            <div htmlFor={`${dia}-checkbox`} className="form-label">
                                                {`${dia.charAt(0).toUpperCase() + dia.slice(1)}`}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${styles.checkbox}`}
                                                id={`${dia}-checkbox`}
                                                checked={selecionado}
                                                onChange={() => handleDiasDaSemanaChange(dia)}
                                            />
                                        </div>
                                        {selecionado && (
                                            <div className={`col ${styles.time_container}`}>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-inicio`} className="form-label"><h6 className={styles.time}>Horário de início</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-inicio`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.inicio || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "inicio")}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-fim`} className="form-label"><h6 className={styles.time}>Horário de fim</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-fim`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.fim || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "fim")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                        <div className="col">
                            {Object.entries(diasDaSemana)
                                .filter(([dia]) => ['Sexta'].includes(dia))
                                .map(([dia, selecionado]) => (
                                    <div key={dia}>
                                        <div className={styles.input_space}>
                                            <div htmlFor={`${dia}-checkbox`} className="form-label">
                                                {`${dia.charAt(0).toUpperCase() + dia.slice(1)}`}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${styles.checkbox}`}
                                                id={`${dia}-checkbox`}
                                                checked={selecionado}
                                                onChange={() => handleDiasDaSemanaChange(dia)}
                                            />
                                        </div>
                                        {selecionado && (
                                            <div className={`col ${styles.time_container}`}>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-inicio`} className="form-label"><h6 className={styles.time}>Horário de início</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-inicio`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.inicio || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "inicio")}
                                                    />
                                                </div>
                                                <div className="col">
                                                    <div htmlFor={`${dia}-fim`} className="form-label"><h6 className={styles.time}>Horário de fim</h6></div>
                                                    <input
                                                        type="time"
                                                        className={`form-control ${styles.input}`}
                                                        id={`${dia}-fim`}
                                                        value={cronograma.horariosJson[dia.toUpperCase()]?.fim || ""}
                                                        onChange={handleHorarioChange(dia.toUpperCase(), "fim")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>

                       
                    </div> 
                </div>

                <div className={styles.button_box}>
                    <CancelarWhiteButton />
                    <button type="button" className={styles.criar_button} onClick={handleCreateCronograma}>
                        Criar
                    </button>
                </div>

            </form>
        </div>
    );
}

export default CreateCronograma;
