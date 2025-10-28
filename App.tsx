
import React, { useState } from 'react';
import type { FormData } from './types';
import { Section, InputGroup, CheckboxGroup, RadioGroup } from './components/FormControls';
import { BuildingIcon, TargetIcon, UsersIcon, WrenchIcon, DollarSignIcon, InfoIcon, FileTextIcon } from './components/Icons';

const initialFormData: FormData = {
  fullName: '',
  companyName: '',
  phone: '',
  email: '',
  website: '',
  niche: '',
  objectives: [],
  otherObjective: '',
  challenge: '',
  targetAudience: '',
  competitors: '',
  services: [],
  budget: '',
  deadline: '',
  foundUsBy: '',
  additionalInfo: '',
};

const OBJECTIVE_OPTIONS = [
    'Aumentar as vendas / Gerar mais leads qualificados',
    'Fortalecer o reconhecimento da minha marca (Branding)',
    'Aumentar o tráfego do meu site',
    'Melhorar o engajamento nas redes sociais',
    'Lançar um novo produto/serviço',
    'Outro',
];

const SERVICE_OPTIONS = [
    'Otimização para Buscas (SEO)',
    'Gestão de Redes Sociais',
    'Anúncios Pagos (Google Ads / Meta Ads)',
    'Criação ou Redesign de Site / Landing Page',
    'Automação com Chatbot',
    'Não tenho certeza, preciso de uma recomendação.',
];

const BUDGET_OPTIONS = [
    'Até R$ 1.000',
    'Entre R$ 1.000 e R$ 2.500',
    'Entre R$ 2.500 e R$ 5.000',
    'Acima de R$ 5.000',
    'Prefiro discutir essa questão por telefone',
];

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const currentValues = formData[name as keyof FormData] as string[];
    
    if (checked) {
      setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: currentValues.filter((item) => item !== value) }));
    }
  };

  const generatePdf = () => {
    setIsGenerating(true);
    try {
      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let y = margin;

      // Fix: Made the `options` parameter optional by providing a default empty object. This resolves errors where `addText` was called with only one argument.
      const addText = (text: string, options: { fontSize?: number; fontStyle?: 'normal' | 'bold'; isTitle?: boolean; isSubtitle?: boolean; spacing?: number, x?: number, isWrapped?: boolean } = {}) => {
        const { fontSize = 10, fontStyle = 'normal', isTitle = false, isSubtitle = false, spacing = 5, x = margin, isWrapped = true } = options;
        
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        if (isTitle) doc.setTextColor(29, 78, 216); // primary-700
        else if (isSubtitle) doc.setTextColor(51, 65, 85); // slate-700
        else doc.setTextColor(71, 85, 105); // slate-600

        const lines = isWrapped ? doc.splitTextToSize(text, pageWidth - margin * 2) : [text];
        doc.text(lines, x, y);
        y += (lines.length * (fontSize / 2.8)) + spacing;
      };

      // Header
      addText('Briefing de Análise - Marketing Digital', { fontSize: 22, fontStyle: 'bold', isTitle: true, spacing: 15 });
      addText(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, { fontSize: 9, spacing: 10 });

      // Sections
      addText('1. Informações da Empresa e Contato', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(`Nome / Razão Social: ${formData.fullName || 'N/A'}`);
      addText(`Empresa / Marca: ${formData.companyName || 'N/A'}`);
      addText(`Telefone (WhatsApp): ${formData.phone || 'N/A'}`);
      addText(`E-mail: ${formData.email || 'N/A'}`);
      addText(`Website / Redes Sociais: ${formData.website || 'N/A'}`);
      addText(`Setor / Nicho de Mercado: ${formData.niche || 'N/A'}`, { spacing: 10 });
      
      addText('2. Objetivos do Projeto', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(`Principal Objetivo: ${formData.objectives.filter(o => o !== 'Outro').join(', ') || 'N/A'}`);
      if(formData.objectives.includes('Outro')) addText(`Outro Objetivo: ${formData.otherObjective || 'N/A'}`);
      addText(`Maior desafio de marketing: ${formData.challenge || 'N/A'}`, { spacing: 10 });

      addText('3. Público-Alvo e Concorrência', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(`Cliente Ideal (Público-Alvo): ${formData.targetAudience || 'N/A'}`);
      addText(`Principais Concorrentes: ${formData.competitors || 'N/A'}`, { spacing: 10 });
      
      addText('4. Serviços de Interesse', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(formData.services.join('\n') || 'N/A', { spacing: 10 });

      addText('5. Orçamento e Prazos', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(`Faixa de Investimento Mensal: ${formData.budget || 'N/A'}`);
      addText(`Prazo ou Data de Início: ${formData.deadline || 'N/A'}`, { spacing: 10 });

      addText('6. Informações Adicionais', { fontSize: 16, fontStyle: 'bold', isSubtitle: true, spacing: 8 });
      addText(`Como nos encontrou: ${formData.foundUsBy || 'N/A'}`);
      addText(`Informações Adicionais: ${formData.additionalInfo || 'N/A'}`);

      doc.save(`briefing_${formData.companyName.replace(/\s+/g, '_') || 'cliente'}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console para mais detalhes.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans antialiased">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">Formulário de Análise</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Preencha as informações abaixo para gerarmos uma proposta inicial para seu projeto.</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-12">
            <Section title="Informações da Empresa e Contato" icon={<BuildingIcon />}>
                <InputGroup label="Nome Completo / Razão Social" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Seu nome completo ou da empresa" required />
                <InputGroup label="Nome da Empresa / Marca" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Como sua marca é conhecida" required />
                <InputGroup label="Telefone com DDD (WhatsApp)" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" type="tel" required />
                <InputGroup label="E-mail para Contato" name="email" value={formData.email} onChange={handleInputChange} placeholder="seu.email@exemplo.com" type="email" required />
                <InputGroup label="Website Atual e/ou @ das Redes Sociais" name="website" value={formData.website} onChange={handleInputChange} placeholder="www.seusite.com.br ou @seuperfil" required />
                <InputGroup label="Qual o seu setor/nicho de mercado?" name="niche" value={formData.niche} onChange={handleInputChange} placeholder="Ex: Varejo de moda, tecnologia B2B, etc." />
            </Section>

            <Section title="Objetivos do Projeto" icon={<TargetIcon />}>
                <CheckboxGroup label="Qual é o principal objetivo que você deseja alcançar com nossos serviços?" name="objectives" options={OBJECTIVE_OPTIONS} selectedOptions={formData.objectives} onChange={handleCheckboxChange} />
                {formData.objectives.includes('Outro') && (
                    <InputGroup label="Especifique o outro objetivo" name="otherObjective" value={formData.otherObjective} onChange={handleInputChange} placeholder="Descreva seu objetivo específico" />
                )}
                <InputGroup label="Qual é o maior desafio de marketing que sua empresa enfrenta hoje?" name="challenge" value={formData.challenge} onChange={handleInputChange} type="textarea" placeholder="Descreva a dor ou dificuldade que você quer resolver." />
            </Section>
            
            <Section title="Público-Alvo e Concorrência" icon={<UsersIcon />}>
                <InputGroup label="Descreva brevemente seu cliente ideal (público-alvo)." name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} type="textarea" placeholder="Ex: Idade, gênero, localização, interesses, profissão" />
                <InputGroup label="Quem são seus 2 ou 3 principais concorrentes?" name="competitors" value={formData.competitors} onChange={handleInputChange} type="textarea" placeholder="Liste os sites ou @ das redes sociais deles" />
            </Section>

            <Section title="Serviços de Interesse" icon={<WrenchIcon />}>
                <CheckboxGroup label="Quais dos nossos serviços mais lhe interessam?" name="services" options={SERVICE_OPTIONS} selectedOptions={formData.services} onChange={handleCheckboxChange} />
            </Section>
            
            <Section title="Orçamento e Prazos" icon={<DollarSignIcon />}>
                <RadioGroup label="Qual é a faixa de investimento mensal que você planeja destinar ao marketing digital?" name="budget" options={BUDGET_OPTIONS} selectedValue={formData.budget} onChange={handleInputChange} />
                <InputGroup label="Existe um prazo final ou data específica para o início do projeto?" name="deadline" value={formData.deadline} onChange={handleInputChange} placeholder="Ex: Lançamento em 3 meses" />
            </Section>
            
            <Section title="Informações Adicionais" icon={<InfoIcon />}>
                <InputGroup label="Como você nos encontrou?" name="foundUsBy" value={formData.foundUsBy} onChange={handleInputChange} placeholder="Ex: Google, Indicação, Instagram" />
                <InputGroup label="Há mais alguma informação que você gostaria de compartilhar sobre o projeto?" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} type="textarea" placeholder="Qualquer detalhe adicional é bem-vindo." />
            </Section>

          </form>
        </div>
      </main>
      
      <footer className="sticky bottom-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto flex justify-end">
              <button
                  onClick={generatePdf}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-primary-600 rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-all duration-300 ease-in-out disabled:bg-primary-300 disabled:cursor-not-allowed"
              >
                  {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gerando...
                    </>
                  ) : (
                    <>
                        <FileTextIcon />
                        Gerar Análise em PDF
                    </>
                  )}
              </button>
          </div>
      </footer>
    </div>
  );
};

export default App;