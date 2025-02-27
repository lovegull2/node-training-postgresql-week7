const { EntitySchema } = require('typeorm')

const dbEntityName = 'Skill';

module.exports = {
    /** 資料庫 - 教練技能 */
    dbEntityNameSkill: dbEntityName,
    Skill: new EntitySchema({
        name: dbEntityName,
        tableName: "SKILL",
        columns: {
            id: {
                primary: true,
                type: "uuid",
                generated: "uuid",
                nullable: false
            },
            name: {
                type: "varchar",
                length: 50,
                nullable: false,
                unique: true
            },
            createdAt: {
                type: "timestamp",
                createDate: true,
                name: "created_at",
                nullable: false
            }
        }
    })
}