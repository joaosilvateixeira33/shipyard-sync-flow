import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import {
  Anchor,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Mail,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Ship,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

// 🔗 Substitua esta URL pelo endpoint do seu webhook (Make/Zapier/n8n/etc.)
const WEBHOOK_URL = "https://hook.us2.make.com/dtwj0j85ynzayttrmmiixld4qgj2io85";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handleFormSubmit = async (
  email: string,
  file: File,
): Promise<{ ok: boolean; data?: unknown; error?: string }> => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("file", file);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      return { ok: false, error: `Erro ${response.status}` };
    }
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      // webhook can return plain text
    }
    return { ok: true, data };
  } catch (error) {
    console.error("Erro ao enviar para o Make:", error);
    return { ok: false, error: (error as Error).message };
  }
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emailValid = emailRegex.test(email.trim());
  const canSubmit = !!file && emailValid && !submitting;

  const acceptFile = useCallback((f: File) => {
    const ok =
      f.type === "application/pdf" ||
      f.type.startsWith("image/") ||
      /\.(pdf|png|jpg|jpeg|webp)$/i.test(f.name);
    if (!ok) {
      setFeedback({ type: "error", msg: "Formato inválido. Envie PDF ou imagem." });
      return;
    }
    setFile(f);
    setFeedback(null);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !emailValid) return;
    setSubmitting(true);
    setFeedback(null);

    const result = await handleFormSubmit(email.trim(), file);

    if (result.ok) {
      setFeedback({
        type: "success",
        msg: "Relatório processado e enviado com sucesso.",
      });
    } else {
      setFeedback({
        type: "error",
        msg: result.error ?? "Falha ao enviar. Tente novamente.",
      });
    }
    setSubmitting(false);
  };

  const FileIcon = file?.type.startsWith("image/") ? ImageIcon : FileText;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-[image:var(--gradient-primary)] text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Anchor className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs uppercase tracking-[0.2em] text-white/70">
                Wilson Sons · Estaleiro
              </p>
              <h1 className="truncate text-lg font-semibold sm:text-xl">
                Painel de Operações
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 sm:flex">
            <Ship className="h-4 w-4" />
            <span>Sistema Operacional</span>
            <span className="ml-1 h-2 w-2 rounded-full bg-success" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Intro */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Processamento de Documentos do Estaleiro
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Envie plantas, manifestos ou fotos de inspeção. O sistema processa o
            documento e envia o relatório de peças e status de estoque para o
            e-mail informado.
          </p>
        </section>

        {/* Steps */}
        <ol className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { n: 1, t: "Enviar arquivo", d: "PDF ou imagem" },
            { n: 2, t: "Informar e-mail", d: "Destino do relatório" },
            { n: 3, t: "Processar & enviar", d: "Envio automático" },
          ].map((s) => (
            <li
              key={s.n}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-soft)]"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                {s.n}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.t}</p>
                <p className="truncate text-xs text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
          {/* Upload */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Documento
                </h3>
                {file && (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" /> Remover
                  </button>
                )}
              </div>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-12 ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border bg-[image:var(--gradient-surface)] hover:border-primary/50 hover:bg-primary/[0.03]"
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) acceptFile(f);
                  }}
                />
                {!file ? (
                  <>
                    <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium">
                      Arraste e solte o arquivo aqui
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ou clique para selecionar · PDF, PNG, JPG (até 20 MB)
                    </p>
                  </>
                ) : (
                  <div className="flex w-full min-w-0 items-center gap-4 text-left">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <FileIcon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(file.size)} ·{" "}
                        {file.type || "arquivo"}
                      </p>
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/20 sm:inline-flex">
                      Pronto
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Email + submit */}
          <div className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Destinatário
                </h3>
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail para envio do relatório
                </label>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="operacoes@wilsonsons.com.br"
                    className={`w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 ${
                      emailTouched && !emailValid
                        ? "border-destructive/60 focus:ring-destructive/30"
                        : "border-input focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {emailTouched && !emailValid && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> Informe um e-mail
                    válido.
                  </p>
                )}
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando documento…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Processar & Enviar Relatório
                    </>
                  )}
                </button>
                {feedback && (
                  <div
                    className={`mt-3 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ring-1 ${
                      feedback.type === "success"
                        ? "bg-success/10 text-success ring-success/20"
                        : "bg-destructive/10 text-destructive ring-destructive/20"
                    }`}
                  >
                    {feedback.type === "success" ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{feedback.msg}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Results */}
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
                Resultado do Processamento
              </h3>
              <p className="text-sm text-muted-foreground">
                Peças identificadas e status de estoque.
              </p>
            </div>
            {results.length > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: "Total", v: summary.total, c: "text-foreground" },
                  { l: "Em estoque", v: summary.inStock, c: "text-success" },
                  { l: "Baixo", v: summary.low, c: "text-warning" },
                  { l: "Sem estoque", v: summary.out, c: "text-destructive" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-lg border border-border bg-card px-3 py-2 shadow-[var(--shadow-soft)]"
                  >
                    <p className={`text-lg font-bold ${s.c}`}>{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <PackageSearch className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Nenhum relatório processado ainda</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Envie um documento para visualizar os resultados aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] md:block">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Part Number</th>
                      <th className="px-4 py-3 text-left">Descrição</th>
                      <th className="px-4 py-3 text-right">Quantidade</th>
                      <th className="px-4 py-3 text-left">Status Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const s = statusStyle(r.status);
                      const Icon = s.icon;
                      return (
                        <tr
                          key={`${r.partNumber}-${i}`}
                          className="border-t border-border transition hover:bg-secondary/40"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                            {r.partNumber}
                          </td>
                          <td className="px-4 py-3">{r.description}</td>
                          <td className="px-4 py-3 text-right font-medium">
                            {r.quantity}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.cls}`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
                {results.map((r, i) => {
                  const s = statusStyle(r.status);
                  const Icon = s.icon;
                  return (
                    <div
                      key={`${r.partNumber}-${i}`}
                      className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold text-primary">
                            {r.partNumber}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {r.description}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${s.cls}`}
                        >
                          <Icon className="h-3 w-3" />
                          {r.status}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                        <span>Quantidade</span>
                        <span className="font-semibold text-foreground">
                          {r.quantity}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Wilson Sons · Sistema de Gestão do Estaleiro
        </footer>
      </main>
    </div>
  );
}

/* ------------- helpers ------------- */

function parseWebhookResults(data: unknown): ReportItem[] {
  if (!data) return [];
  const arr = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] })?.items)
    ? (data as { items: unknown[] }).items
    : Array.isArray((data as { results?: unknown[] })?.results)
    ? (data as { results: unknown[] }).results
    : [];
  return arr
    .map((raw): ReportItem | null => {
      const o = raw as Record<string, unknown>;
      const partNumber = String(o.partNumber ?? o.part_number ?? o.part ?? "");
      const description = String(o.description ?? o.desc ?? "");
      const quantity = Number(o.quantity ?? o.qty ?? 0);
      const statusRaw = String(o.status ?? o.stockStatus ?? "").toLowerCase();
      let status: StockStatus = "Em Estoque";
      if (statusRaw.includes("sem") || statusRaw.includes("out")) status = "Sem Estoque";
      else if (statusRaw.includes("baix") || statusRaw.includes("low")) status = "Estoque Baixo";
      if (!partNumber && !description) return null;
      return { partNumber, description, quantity, status };
    })
    .filter((v): v is ReportItem => v !== null);
}

function demoRows(): ReportItem[] {
  return [
    { partNumber: "WS-4021-A", description: "Válvula de esfera 4\" bronze naval", quantity: 12, status: "Em Estoque" },
    { partNumber: "WS-7788-C", description: "Rolamento SKF 6208-2RS", quantity: 3, status: "Estoque Baixo" },
    { partNumber: "WS-1102-B", description: "Chapa de aço naval AH36 8mm", quantity: 0, status: "Sem Estoque" },
    { partNumber: "WS-3345-D", description: "Eletrodo de solda inox 3.25mm (kg)", quantity: 45, status: "Em Estoque" },
    { partNumber: "WS-9910-E", description: "Anodo de zinco para casco 2kg", quantity: 6, status: "Estoque Baixo" },
    { partNumber: "WS-5521-F", description: "Cabo de aço galvanizado 12mm (m)", quantity: 120, status: "Em Estoque" },
  ];
}
