import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeavyLoadersComponent } from './heavy-loaders.component';

describe('HeavyLoadersComponent', () => {
  let component: HeavyLoadersComponent;
  let fixture: ComponentFixture<HeavyLoadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeavyLoadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeavyLoadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
