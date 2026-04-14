import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.services';
import { TransactionService } from '../services/transaction.service';
import { LoadingService } from '../services/loading.service';
import { Transaction } from '../models/transaction.model';
import { NgChartsModule } from 'ng2-charts';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChartData, ChartOptions } from 'chart.js';
import { take } from 'rxjs/operators';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private loadingService = inject(LoadingService);

  transactions: Transaction[] = [];
  recentTransactions: Transaction[] = [];
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  isDataReady = false;

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Pemasukan', backgroundColor: '#2fa08488' },
      { data: [], label: 'Pengeluaran', backgroundColor: '#e53e3e88' },
    ],
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#6c63ff',
          '#2fa084',
          '#e53e3e',
          '#dd6b20',
          '#3182ce',
          '#d69e2e',
          '#805ad5',
          '#319795',
        ],
      },
    ],
  };

  doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'right' } },
  };

  ngOnInit() {
    this.loadingService.show();
    let firstLoad = true;

    this.transactionService.getTransactions().subscribe((data) => {
      this.transactions = data;
      this.calculateSummary(data);
      this.buildBarChart(data);
      this.buildDoughnutChart(data);
      this.calculateRecentTransactions(data);
      this.isDataReady = true;
      if (firstLoad) {
        this.loadingService.hide();
        firstLoad = false;
      }
    });
  }

  calculateSummary(data: Transaction[]) {
    this.totalIncome = data
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    this.totalExpense = data
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    this.balance = this.totalIncome - this.totalExpense;
  }

  buildBarChart(data: Transaction[]) {
    const months: string[] = [];
    const incomeMap: Record<string, number> = {};
    const expenseMap: Record<string, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('id-ID', {
        month: 'short',
        year: 'numeric',
      });
      months.push(key);
      incomeMap[key] = 0;
      expenseMap[key] = 0;
    }

    data.forEach((t) => {
      const raw = t.date as any;
      const d = raw?.toDate ? raw.toDate() : new Date(raw);
      const key = d.toLocaleString('id-ID', {
        month: 'short',
        year: 'numeric',
      });
      if (incomeMap[key] !== undefined) {
        if (t.type === 'income') incomeMap[key] += t.amount;
        else expenseMap[key] += t.amount;
      }
    });

    this.barChartData = {
      labels: months,
      datasets: [
        {
          data: months.map((m) => incomeMap[m]),
          label: 'Pemasukan',
          backgroundColor: '#2fa08488',
        },
        {
          data: months.map((m) => expenseMap[m]),
          label: 'Pengeluaran',
          backgroundColor: '#e53e3e88',
        },
      ],
    };
  }

  buildDoughnutChart(data: Transaction[]) {
    const expenseByCategory: Record<string, number> = {};
    data
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expenseByCategory[t.category] =
          (expenseByCategory[t.category] || 0) + t.amount;
      });

    this.doughnutChartData = {
      labels: Object.keys(expenseByCategory),
      datasets: [
        {
          data: Object.values(expenseByCategory),
          backgroundColor: [
            '#6c63ff',
            '#2fa084',
            '#e53e3e',
            '#dd6b20',
            '#3182ce',
            '#d69e2e',
            '#805ad5',
            '#319795',
          ],
        },
      ],
    };
  }

  calculateRecentTransactions(data: Transaction[]) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.recentTransactions = data
      .filter((t) => {
        const raw = t.date as any;
        const d = raw?.toDate ? raw.toDate() : new Date(raw);
        return d >= thirtyDaysAgo;
      })
      .slice(0, 5);
  }

  async logout() {
    await this.authService.logout();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
