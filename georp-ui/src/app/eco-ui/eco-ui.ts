import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eco-ui',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './eco-ui.html',
  styleUrl: './eco-ui.scss'
})
export class EcoUi {
  data: Array<{ resource: string; value: number }> = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.http.get('/api/countryReport.js').subscribe((response: any) => {
      this.data = response;
    });
  }

  sendWebhook() {
    this.http.post('/.netlify/functions/sendDiscordWebhook', {}).subscribe(() => {
      alert('Webhook sent successfully!');
    });
  }
}
