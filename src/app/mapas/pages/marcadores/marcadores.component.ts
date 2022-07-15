import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
    .mapa-container {
      height: 100%;
      width: 100%;
    }

    .list-group {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99;
    }

    li {
      cursor: pointer;
    }
    `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-76.52654002731019, 3.370365318982014,];
  marcadores: MarcadorColor[] = [];

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLevel
    });

    this.recuperarMarcadores();
  }

  irMarcador(marker: mapboxgl.Marker): void {
    this.mapa.flyTo({
      center: marker.getLngLat(),
      zoom: 17
    })
  }

  agregarMarcador(): void {
    const color: string = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const nuevoMarcador = new mapboxgl.Marker({
      draggable: true,
      color
    })
      .setLngLat(this.center)
      .addTo(this.mapa)

    this.marcadores.push({
      color,
      marker: nuevoMarcador
    });

    this.guardarMarcadores();

    nuevoMarcador.on('dragend', () => {
      this.guardarMarcadores();
    });

  }

  guardarMarcadores(): void {
    const lngLatArr: MarcadorColor[] = [];

    this.marcadores.forEach ( m => {
      const color = m.color;
      const { lng, lat } = m.marker!.getLngLat();

      lngLatArr.push({
        color,
        centro: [lng, lat]
      });

    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArr));

  }

  recuperarMarcadores(): void {
    if (!localStorage.getItem('marcadores')) {
      return;
    }

    const lngLatArr: MarcadorColor[] = JSON.parse(localStorage.getItem('marcadores')!);

    lngLatArr.forEach( m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      })
        .setLngLat(m.centro!)
        .addTo(this.mapa)

      this.marcadores.push({
        marker: newMarker,
        color: m.color
      })

    });

  }

  borrarMarcador(i: number): void {
    this.marcadores[i].marker?.remove();
    this.marcadores.splice(i, 1);
    this.guardarMarcadores();
  }

}
