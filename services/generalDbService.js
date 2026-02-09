"use strict";

const select = async (table, filter) => {
  const data = await knex(table)
    .select(filter)
    .catch((ex) => {
      console.log(ex);
      return [];
    });

  return data;
};

const selectPage = async (table, filter, currentPage, perPage) => {
  const data = await knex(table)
    .select(filter)
    .paginate({
      perPage,
      currentPage,
      isLengthAware: true,
    })
    .catch((ex) => {
      console.log(ex);
      return [];
    });

  return data;
};

const selectPageWhere = async (
  whereFields,
  table,
  filter,
  currentPage,
  perPage
) => {
  const data = await knex(table)
    .select(filter)
    .where((q) => {
      whereFields.map((row) => {
        const { field, value } = row;
        q.where(field, value);
      });
    })
    .paginate({
      perPage,
      currentPage,
      isLengthAware: true,
    })
    .catch((ex) => {
      console.log(ex);
      return [];
    });

  return data;
};

const selectWhere = async (whereFields, table, filter) => {
  try {
    const data = await knex(table)
      .select(filter)
      .where((q) => {
        whereFields?.map((row) => {
          const { field, value } = row;
          q.where(field, value);
        });
      })
      .catch((ex) => {
        console.log(ex);
        return [];
      });

    return data;
  } catch (ex) {
    return [];
  }
};

const selectWhereLeftOuterJoin = async (
  whereFields,
  table,
  filter,
  joinFields
) => {
  try {
    const data = await knex(table)
      .select(filter)
      .where((q) => {
        whereFields?.map((row) => {
          const { field, value } = row;
          q.where(field, value);
        });
      })
      .leftOuterJoin((j) => {
        joinFields?.map((row) => {
          const { otherTable, currentTableField, otherTableField } = row;
          j.leftOuterJoin(
            otherTable,
            `${table}.${currentTableField}`,
            `${otherTable}.${otherTableField}`
          );
        });
      })
      .catch((ex) => {
        console.log(ex);
        return [];
      });

    return data;
  } catch (ex) {
    return [];
  }
};

const insertRecord = async (data, table, idname) => {
  try {
    const result = await knex(table)
      .insert(data, idname)
      .catch((ex) => {
        console.log(ex);
        return false;
      });

    return result;
  } catch (ex) {
    console.log(ex);
    return false;
  }
};

const upsertRecord = async (data, table, conflictId) => {
  try {
    await knex(table)
      .insert(data)
      .onConflict(conflictId)
      .merge()
      .catch((ex) => {
        console.log(ex);
        return false;
      });

    return true;
  } catch (ex) {
    return false;
  }
};

const updateRecord = async (data, table, idName, id) => {
  try {
    await knex(table)
      .update(data)
      .where(idName, id)
      .catch((ex) => {
        console.log(ex);
        return false;
      });

    return true;
  } catch (ex) {
    return false;
  }
};

const updateRecordWhereNot = async (data, table, idName, id) => {
  try {
    await knex(table)
      .update(data)
      .whereNot(idName, id)
      .catch((ex) => {
        console.log(ex);
        return false;
      });

    return true;
  } catch (ex) {
    return false;
  }
};

const delRecord = async (table, idName, id) => {
  await knex(table)
    .delete()
    .where(idName, id)
    .catch((ex) => {
      console.log(ex);
      return false;
    });

  return true;
};

const bulkinsert = async (rows, from) => {
  if (rows.length > 0) {
    knex
      .transaction((tr) =>
        knex.batchInsert("reviews", rows, 100).transacting(tr)
      )
      .then(() => {
        logger.log({
          level: "info",
          message: `${displaydate()} ${
            rows.length
          } new review(s) saved from ${from}`,
        });
      })
      .catch((error) => {
        logger.log({
          level: "error",
          message: `${displaydate()} Database error -  ${error.message}`,
        });
      });
  } else {
    logger.log({
      level: "info",
      message: `${displaydate()} No new reviews found on ${from}`,
    });
  }
};

module.exports = {
  select,
  selectWhere,
  insertRecord,
  updateRecord,
  selectPage,
  delRecord,
  selectPageWhere,
  upsertRecord,
  selectWhereLeftOuterJoin,
  updateRecordWhereNot,
};
