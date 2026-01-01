import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsUUID, Matches, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongP@ssw0rd',
        description:
            'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message:
                'Password must include uppercase, lowercase, number, and special character',
        },
    )
    password: string;

    @ApiProperty({
        example: 'Ahmed',
        description: 'User first name',
    })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({
        example: 'Hassan',
        description: 'User last name',
    })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsUUID()
    roleId: string; // associate user with a role
}
