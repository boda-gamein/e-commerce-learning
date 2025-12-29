import { IsEmail, IsString, IsUUID, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsUUID()
    roleId: string; // associate user with a role
}
