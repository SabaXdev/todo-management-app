import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { StorageKey } from '../enums/storage-key.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated when storage is empty', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.accessToken()).toBeNull();
  });

  it('persists token and user on successful login', () => {
    const fakeResponse = {
      accessToken: 'abc.def.ghi',
      user: {
        id: 'u-1',
        email: 'a@b.com',
        name: 'A',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    };

    service.login({ email: 'a@b.com', password: 'Password1' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(fakeResponse);

    expect(service.accessToken()).toBe('abc.def.ghi');
    expect(service.currentUser()?.email).toBe('a@b.com');
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem(StorageKey.AccessToken)).toContain('abc.def.ghi');
  });

  it('clears local session on logout', () => {
    localStorage.setItem(StorageKey.AccessToken, JSON.stringify('x'));
    localStorage.setItem(
      StorageKey.CurrentUser,
      JSON.stringify({ id: 'u-1', email: 'a@b.com', name: 'A' }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    expect(service.isAuthenticated()).toBeTrue();
    service.logout();
    httpMock.expectOne(`${environment.apiBaseUrl}/auth/logout`).flush({ success: true });

    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem(StorageKey.AccessToken)).toBeNull();
  });
});
