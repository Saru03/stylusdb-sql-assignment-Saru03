// src/queryParser.js
function parseQuery(query) {
    query = query.trim();
    let selectPart, fromPart;
    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0];
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;
    let joinPart = null, joinType = null;
    // Check for JOIN clauses and split accordingly
    if (query.includes(' INNER JOIN ')) {
        [selectPart, joinPart] = query.split(/\s+INNER\s+JOIN\s+/i);
        joinType = 'INNER';
    } else if (query.includes(' LEFT JOIN ')) {
        [selectPart, joinPart] = query.split(/\s+LEFT\s+JOIN\s+/i);
        joinType = 'LEFT';
    } else if (query.includes(' RIGHT JOIN ')) {
        [selectPart, joinPart] = query.split(/\s+RIGHT\s+JOIN\s+/i);
        joinType = 'RIGHT';
    } else {
        // If no join type is found, treat it as a simple select query
        selectPart = query;
    }
    
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }
    
    let joinTable = null, joinCondition = null;
    if (joinPart) {
        const joinInfo = parseJoinClause(joinPart);
        joinTable = joinInfo.joinTable;
        joinCondition = joinInfo.joinCondition;
        const joinRegex = /^(.+?)\sON\s([\w.]+)\s*=\s*([\w.]+)/i;
        const joinMatch = joinPart.match(joinRegex);
        if (!joinMatch) {
            throw new Error('Invalid JOIN format');
        }

        joinTable = joinMatch[1].trim();
        joinCondition = {
            left: joinMatch[2].trim(),
            right: joinMatch[3].trim()
        };
    }
    
    const [, fields, table] = selectMatch;
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }
    
    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinTable,
        joinCondition,
        joinType
    };
}

// function parseQuery(query) {
//     query = query.trim();
//     let selectPart, fromPart;
//     const whereSplit = query.split(/\sWHERE\s/i);
//     query = whereSplit[0];
//     const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;
//     let joinPart = null, joinType = null;
//     // Check for JOIN clauses and split accordingly
//     if (query.includes(' INNER JOIN ')) {
//         [selectPart, joinPart] = query.split(/\s+INNER\s+JOIN\s+/i);
//         joinType = 'INNER';
//     } else if (query.includes(' LEFT JOIN ')) {
//         [selectPart, joinPart] = query.split(/\s+LEFT\s+JOIN\s+/i);
//         joinType = 'LEFT';
//     } else if (query.includes(' RIGHT JOIN ')) {
//         [selectPart, joinPart] = query.split(/\s+RIGHT\s+JOIN\s+/i);
//         joinType = 'RIGHT';
//     } else {
//         // If no join type is found, treat it as a simple select query
//         selectPart = query;
//     }
    
//     const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
//     const selectMatch = selectPart.match(selectRegex);
//     if (!selectMatch) {
//         throw new Error('Invalid SELECT format');
//     }
    
//     let joinTable = null, joinCondition = null;
//     if (joinPart) {
//         const joinInfo = parseJoinClause(joinPart);
//         joinTable = joinInfo.joinTable;
//         joinCondition = joinInfo.joinCondition;
//     }
    
//     const [, fields, table] = selectMatch;
//     let whereClauses = [];
//     if (whereClause) {
//         whereClauses = parseWhereClause(whereClause);
//     }
    
//     return {
//         fields: fields.split(',').map(field => field.trim()),
//         table: table.trim(),
//         whereClauses,
//         joinTable,
//         joinCondition,
//         joinType
//     };
// }

function parseJoinClause(query) {
    const joinRegex = /\s*(INNER|LEFT|RIGHT)\s+JOIN\s+(.+?)\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/i;

    const joinMatch = query.match(joinRegex);

    if (joinMatch) {
        return {
            joinType: joinMatch[1].trim(),
            joinTable: joinMatch[2].trim(),
            joinCondition: {
                left: joinMatch[3].trim(),
                right: joinMatch[4].trim()
            }
        };
    }

    return {
        joinType: null,
        joinTable: null,
        joinCondition: null
    };
}

function parseWhereClause(whereString) {
    const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);
        if (match) {
            const [, field, operator, value] = match;
            return { field: field.trim(), operator, value: value.trim() };
        }
        throw new Error('Invalid WHERE clause format');
    });
}

module.exports = { parseQuery, parseJoinClause };