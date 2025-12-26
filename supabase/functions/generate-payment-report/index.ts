import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Payment {
  id: string;
  client_name: string;
  payment_method: string;
  amount_paid: number;
  timestamp: string;
  service_type?: string;
}

interface DailySummary {
  cash: number;
  zelle: number;
  check: number;
  bookerCC: number;
  total: number;
}

function getETDateString(utcTimestamp: string): string {
  const date = new Date(utcTimestamp);

  const etDateTimeString = date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  });

  const [datePart] = etDateTimeString.split(", ");
  const [month, day, year] = datePart.split("/");

  return `${year}-${month}-${day}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const paymentMethod = url.searchParams.get("paymentMethod") || "";

    if (!dateFrom || !dateTo) {
      return new Response(
        JSON.stringify({ error: "dateFrom and dateTo parameters are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("=== REPORT GENERATION DEBUG ===");
    console.log("Requested date range:", { dateFrom, dateTo, paymentMethod });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: allPayments, error } = await supabase
      .from("payments")
      .select("*")
      .order("timestamp", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log("Total payments in database:", allPayments?.length || 0);

    if (allPayments && allPayments.length > 0) {
      console.log("Sample payment timestamps (first 3):");
      allPayments.slice(0, 3).forEach((p: Payment) => {
        const etDate = getETDateString(p.timestamp);
        console.log(`  - UTC: ${p.timestamp} -> ET Date: ${etDate}`);
      });
    }

    const filteredPayments = (allPayments || []).filter((payment: Payment) => {
      const paymentETDate = getETDateString(payment.timestamp);

      const inDateRange = paymentETDate >= dateFrom && paymentETDate <= dateTo;
      const matchesMethod = !paymentMethod || payment.payment_method === paymentMethod;

      if (allPayments && allPayments.indexOf(payment) < 3) {
        console.log(`Payment filter check:`, {
          client: payment.client_name,
          utcTimestamp: payment.timestamp,
          etDate: paymentETDate,
          dateFrom,
          dateTo,
          inDateRange,
          matchesMethod,
          willInclude: inDateRange && matchesMethod
        });
      }

      return inDateRange && matchesMethod;
    });

    console.log("Filtered payments count:", filteredPayments.length);
    console.log("Filter criteria:", { dateFrom, dateTo, paymentMethod: paymentMethod || "all" });

    const summary: DailySummary = {
      cash: 0,
      zelle: 0,
      check: 0,
      bookerCC: 0,
      total: 0,
    };

    filteredPayments.forEach((payment: Payment) => {
      const amount = parseFloat(payment.amount_paid.toString());
      summary.total += amount;

      switch (payment.payment_method) {
        case "Cash":
          summary.cash += amount;
          break;
        case "Zelle":
          summary.zelle += amount;
          break;
        case "Check":
          summary.check += amount;
          break;
        case "Booker CC":
          summary.bookerCC += amount;
          break;
      }
    });

    console.log("Summary calculated:", summary);
    console.log("=== END DEBUG ===");

    const html = generateHTMLReport(filteredPayments, summary, dateFrom, dateTo, paymentMethod);

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        dateFrom: new URL(req.url).searchParams.get("dateFrom"),
        dateTo: new URL(req.url).searchParams.get("dateTo"),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateHTMLReport(
  payments: Payment[],
  summary: DailySummary,
  dateFrom: string,
  dateTo: string,
  paymentMethod: string
): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });
  };

  const formatDateOnly = (dateString: string) => {
    const [year, month, day] = dateString.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const reportTitle = dateFrom === dateTo
    ? formatDateOnly(dateFrom)
    : `${formatDateOnly(dateFrom)} - ${formatDateOnly(dateTo)}`;

  const methodFilter = paymentMethod ? ` (${paymentMethod} only)` : " (All Payment Methods)";

  const now = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Report - ${reportTitle}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .report {
      background: white;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0;
      color: #1e293b;
      font-size: 32px;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #64748b;
      font-size: 16px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    .summary-card.cash {
      border-left-color: #16a34a;
    }
    .summary-card.zelle {
      border-left-color: #2563eb;
    }
    .summary-card.check {
      border-left-color: #f59e0b;
    }
    .summary-card.bookercc {
      border-left-color: #8b5cf6;
    }
    .summary-card.total {
      border-left-color: #1e293b;
      background: #1e293b;
      color: white;
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.8;
    }
    .summary-card.total h3 {
      opacity: 1;
    }
    .summary-card .amount {
      font-size: 28px;
      font-weight: bold;
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    thead {
      background: #f8fafc;
    }
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    tbody tr:hover {
      background: #f8fafc;
    }
    .method-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .method-cash {
      background: #dcfce7;
      color: #166534;
    }
    .method-zelle {
      background: #dbeafe;
      color: #1e40af;
    }
    .method-check {
      background: #fef3c7;
      color: #92400e;
    }
    .method-booker-cc {
      background: #ede9fe;
      color: #5b21b6;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
    .no-payments {
      text-align: center;
      padding: 60px 20px;
      color: #64748b;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .report {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>Payment Tracker</h1>
      <p>Payment Report</p>
      <p><strong>${reportTitle}</strong></p>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">${methodFilter}</p>
      <p style="color: #64748b; font-size: 14px; margin-top: 5px;">All times displayed in Eastern Time (ET)</p>
    </div>

    <div class="summary">
      <div class="summary-card cash">
        <h3>Cash Payments</h3>
        <p class="amount">${formatCurrency(summary.cash)}</p>
      </div>
      <div class="summary-card zelle">
        <h3>Zelle Payments</h3>
        <p class="amount">${formatCurrency(summary.zelle)}</p>
      </div>
      <div class="summary-card check">
        <h3>Check Payments</h3>
        <p class="amount">${formatCurrency(summary.check)}</p>
      </div>
      <div class="summary-card bookercc">
        <h3>Booker CC Payments</h3>
        <p class="amount">${formatCurrency(summary.bookerCC)}</p>
      </div>
      <div class="summary-card total">
        <h3>Total Received</h3>
        <p class="amount">${formatCurrency(summary.total)}</p>
      </div>
    </div>

    ${payments.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Client Name</th>
          <th>Service Type</th>
          <th>Payment Method</th>
          <th style="text-align: right;">Amount</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map((payment: Payment) => `
        <tr>
          <td>${payment.client_name}</td>
          <td style="color: #64748b; font-size: 14px;">${payment.service_type || '-'}</td>
          <td>
            <span class="method-badge method-${payment.payment_method.toLowerCase().replace(' ', '-')}">
              ${payment.payment_method}
            </span>
          </td>
          <td style="text-align: right; font-weight: 600;">
            ${formatCurrency(parseFloat(payment.amount_paid.toString()))}
          </td>
          <td style="font-size: 14px;">${formatDate(payment.timestamp)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    ` : `
    <div class="no-payments">
      <p style="font-size: 18px; margin: 0;">No payments recorded for this period</p>
    </div>
    `}

    <div class="footer">
      <p>Report generated on ${now} ET</p>
      <p>${payments.length} payment(s) recorded</p>
    </div>
  </div>
</body>
</html>
  `;
}
