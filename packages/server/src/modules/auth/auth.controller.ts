import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { username: string; password: string; display_name?: string; email?: string },
  ) {
    return this.authService.register(
      body.username,
      body.password,
      body.display_name || body.username, // Use display_name if provided, otherwise use username
    );
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }
}
