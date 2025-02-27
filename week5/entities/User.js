const { EntitySchema } = require('typeorm')

const dbEntityName = 'User';
module.exports = {
    /** 資料庫 - 使用者 */
    dbEntityNameUser: dbEntityName,
    /** 使用者角色 */
    userRole: {
        /** 使用者 */
        USER: 'USER',
        /** 教練 */
        COACH: 'COACH'
    },
    User: new EntitySchema({
        name: dbEntityName,
        tableName: 'USER',
        columns: {
            id: {
                primary: true,
                type: 'uuid',
                generated: 'uuid'
            },
            name: {
                type: 'varchar',
                length: 50,
                nullable: false
            },
            email: {
                type: 'varchar',
                length: 320,
                nullable: false,
                unique: true
            },
            role: {
                type: 'varchar',
                length: 20,
                nullable: false
            },
            password: {
                type: 'varchar',
                length: 72,
                nullable: false,
                select: false
            },
            created_at: {
                type: 'timestamp',
                createDate: true,
                nullable: false
            },
            updated_at: {
                type: 'timestamp',
                updateDate: true,
                nullable: false
            }
        }
    })
}